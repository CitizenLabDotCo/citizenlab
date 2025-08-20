# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::MentionInOfficialFeedbackMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          official_feedback_author_multiloc: { 'en' => 'Citizenlab person' },
          official_feedback_body_multiloc: { 'en' => 'Nice idea, bruh' },
          official_feedback_url: 'https://demo.stg.govocal.com',
          idea_published_at: Time.zone.today.prev_week.iso8601,
          idea_title_multiloc: { 'en' => 'My post is great.' },
          idea_author_name: 'Chuck Norris',
          idea_type: 'Idea'
        }
      }
    end

    let(:campaign) { EmailCampaigns::Campaigns::MentionInOfficialFeedback.create! }
    let(:mailer) { described_class.with(command: command, campaign: campaign) }
    let(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to end_with('mentioned you in their feedback')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      expect(mail.body.encoded).to match(command.dig(:event_payload, :official_feedback_url))
    end

    context 'with custom text' do
      let!(:global_campaign) do
        create(
          :mention_in_official_feedback_campaign,
          subject_multiloc: { 'en' => 'Custom Global Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ post }}' },
          button_text_multiloc: { 'en' => 'CLICK THE GLOBAL BUTTON' }
        )
      end
      let!(:context_campaign) do
        create(
          :mention_in_official_feedback_campaign,
          context: create(:phase),
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
              with_text(/NEW TITLE FOR My post is great\./)
            end
            with_tag 'p' do
              with_text(/Liege mentioned you in their feedback on the idea 'My post is great\.'\. Click the link below to enter the conversation with Liege\./)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: command.dig(:event_payload, :official_feedback_url) }) do
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
              with_text(/NEW TITLE FOR My post is great\./)
            end
            with_tag 'p' do
              with_text(/NEW BODY TEXT/)
            end
          end
        end

        it 'can customise the CTA' do
          expect(mail_body(mail)).to have_tag('a', with: { href: command.dig(:event_payload, :official_feedback_url) }) do
            with_text(/CLICK THE CONTEXT BUTTON/)
          end
        end
      end
    end
  end
end
