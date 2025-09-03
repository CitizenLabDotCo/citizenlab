# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectPhaseStartedMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:project) { create(:project_with_phases) }
    let_it_be(:phase) { project.phases.first }
    let_it_be(:notification) { create(:project_phase_started, recipient: recipient, project: project, phase: phase) }

    let(:campaign) { create(:project_phase_started_campaign) }
    let(:command) do
      activity = create(:activity, item: notification, action: 'created')
      campaign.generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to end_with('entered a new phase')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'renders the reply to email' do
      expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
    end

    it 'includes the header' do
      expect(mail_body(mail)).to have_tag('div') do
        with_tag 'h1' do
          with_text(/A new phase started for project 'Renew West Parc'/)
        end
        with_tag 'p' do
          with_text(/This project entered a new phase on the platform of Liege. Click on the link below to learn more!/)
        end
      end
    end

    it 'includes the CTA' do
      expect(mail_body(mail)).to have_tag('a', with: { href: "http://example.org/en/projects/#{project.slug}/1" }) do
        with_text(/Discover this new phase/)
      end
    end

    it 'includes the unfollow url' do
      expect(mail_body(mail)).to match(Frontend::UrlService.new.unfollow_url(Follower.new(followable: project, user: recipient)))
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :project_phase_started_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ phaseTitle }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :project_phase_started_campaign,
          context: phase,
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ organizationName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Liege'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Idea phase/)
            end
            with_tag 'p' do
              with_text(/This project entered a new phase on the platform of Liege. Click on the link below to learn more!/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: "http://example.org/en/projects/#{project.slug}/1" }) do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - Liege'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(mail_body(mail)).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Idea phase/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: "http://example.org/en/projects/#{project.slug}/1" }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
