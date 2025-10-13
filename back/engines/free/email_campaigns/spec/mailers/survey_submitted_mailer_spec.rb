# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::SurveySubmittedMailer do
  describe 'campaign_mail' do
    before_all do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
      config.save!
      create(:idea_status_proposed)
    end

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:project) { create(:single_phase_native_survey_project) }
    let_it_be(:input) { create(:idea, author: recipient, project: project, creation_phase: project.phases.first) }

    let(:campaign) { create(:survey_submitted_campaign) }
    let(:command) do
      activity = create(:activity, item: input, action: 'published')
      campaign.generate_commands(
        activity: activity,
        recipient: recipient
      ).first.merge({ recipient: recipient })
    end
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('Vaudeville: Thank you for your response! 🎉')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'includes the header' do
      expect(body).to have_tag('div') do
        with_tag 'h1' do
          with_text(/Thank you for sharing your thoughts on "Renew West Parc"/)
        end
        with_tag 'p' do
          with_text(/Your input for "Renew West Parc" has been submitted successfully./)
        end
      end
    end

    it 'includes the idea id' do
      expect(body).to have_tag('p') do
        with_text(input.id)
      end
    end

    it 'includes the download button' do
      expect(body).to have_tag('a') do
        with_text(/Download your responses/)
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :survey_submitted_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ projectName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :survey_submitted_campaign,
          context: input.creation_phase,
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ organizationName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT</b>' },
          button_text_multiloc: { 'en' => 'CLICK THE CONTEXT BUTTON' },
          reply_to: 'noreply@govocal.com'
        )
      end

      context 'on a global campaign' do
        let(:campaign) { global_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Global Subject - Vaudeville'
        end

        it 'renders the reply to email' do
          expect(mail.reply_to).to eq [ENV.fetch('DEFAULT_FROM_EMAIL', 'hello@citizenlab.co')]
        end

        it 'can customize the header' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Renew West Parc/)
            end
            with_tag 'p' do
              with_text(/Your input for "Renew West Parc" has been submitted successfully./)
            end
          end
        end

        it 'includes the download button' do
          expect(body).to have_tag('a') do
            with_text(/CLICK THE GLOBAL BUTTON/)
          end
        end
      end

      context 'on a context campaign' do
        let(:campaign) { context_campaign }

        it 'can customise the subject' do
          expect(mail.subject).to eq 'Custom Context Subject - Vaudeville'
        end

        it 'can customize the reply to email' do
          expect(mail.reply_to).to eq ['noreply@govocal.com']
        end

        it 'can customize the header and fall back to global customzations' do
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Renew West Parc/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'includes the download button' do
          expect(body).to have_tag('a') do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
