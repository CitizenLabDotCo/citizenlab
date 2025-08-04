# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NativeSurveyNotSubmittedMailer do
  describe 'campaign_mail' do
    before_all { create(:idea_status_proposed) }

    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:phase) { create(:native_survey_phase, start_at: '2022-12-01', end_at: '2022-12-31', title_multiloc: { 'en' => 'The Big Survey' }) }
    let_it_be(:idea) { create(:native_survey_response, project: phase.project, phases: [phase], creation_phase: phase) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          survey_url: Frontend::UrlService.new.model_to_url(idea.project, locale: Locale.new(recipient.locale)),
          phase_title_multiloc: idea.creation_phase.title_multiloc,
          phase_end_at: idea.creation_phase.end_at
        }
      }
    end

    let(:campaign) { EmailCampaigns::Campaigns::NativeSurveyNotSubmitted.create! }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to end_with 'Almost there! Submit your answers'
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it "displays 'You started sharing your answers' in the body" do
      expect(mail.body.encoded).to match 'You started sharing your answers'
    end

    it 'displays the correct phase in the body' do
      expect(mail.body.encoded).to match idea.creation_phase.title_multiloc['en']
    end

    it 'displays the end date of the phase in the body' do
      expect(mail.body.encoded).to match 'December 31'
    end

    it "displays 'Resume your survey response' button with a link" do
      project_url = Frontend::UrlService.new.model_to_url(phase.project, locale: Locale.new(recipient.locale))
      expect(mail.body.encoded).to match project_url
      expect(mail.body.encoded).to match 'Resume your survey response'
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :native_survey_not_submitted_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :native_survey_not_submitted_campaign,
          context: phase,
          subject_multiloc: { 'en' => 'Custom Context Subject - {{ organizationName }}' },
          intro_multiloc: { 'en' => '<b>NEW BODY TEXT - {{ phaseTitle }}</b>' },
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
              with_text(/NEW TITLE/)
            end
            with_tag 'p' do
              # Default body text from mailers.en.yml: "You started sharing your answers"
              with_text(/You started sharing your answers/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a') do
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
              with_text(/NEW TITLE/)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT - The Big Survey/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a') do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
