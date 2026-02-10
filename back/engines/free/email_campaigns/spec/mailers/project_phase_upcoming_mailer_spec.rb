# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ProjectPhaseUpcomingMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en', first_name: 'Remy') }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          phase_title_multiloc: { 'en' => 'Example phase title' },
          phase_url: 'https://govocal.com/phases/1',
          project_title_multiloc: { 'en' => 'Example project title' },
          project_description_preview_multiloc: { 'en' => 'Example project description preview' }
        },
        delay: 8.hours.to_i
      }
    end

    let(:campaign) { create(:project_phase_upcoming_campaign) }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }
    let(:body) { mail_body(mail) }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to eq('Get everything set up for the new phase of Example project title')
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
          with_text(/Remy, a project will enter a new phase soon/)
        end
        with_tag 'p' do
          with_text(/The project 'Example project title' will be entering a new phase soon. Make sure everything is set up for this phase: Is there an adequate description?/)
        end
      end
    end

    it 'includes the info box' do
      expect(body).to have_tag('table') do
        with_tag 'div' do
          with_text(/The project will enter the phase 'Example phase title'/)
        end
      end
    end

    it 'includes the CTA' do
      expect(body).to have_tag('a', with: { href: 'https://govocal.com/phases/1' }) do
        with_text(/Set this new phase up/)
      end
    end

    it 'includes the project box' do
      expect(body).to have_tag('table') do
        with_tag 'h2' do
          with_text(/About 'Example project title'/)
        end
        with_tag 'p' do
          with_text(/Example project description preview/)
        end
      end
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :project_phase_upcoming_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ projectName }}' },
          intro_multiloc: { 'en' => 'NEW BODY TEXT {{ phaseTitle }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON {{ firstName }}' }
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
          expect(body).to have_tag('div') do
            with_tag 'h1' do
              with_text(/NEW TITLE FOR Example project title/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT Example phase title/)
            end
          end
        end

        it 'includes the CTA' do
          expect(body).to have_tag('a', with: { href: 'https://govocal.com/phases/1' }) do
            with_text(/CLICK THE GLOBAL BUTTON Remy/)
          end
        end
      end
    end
  end
end
