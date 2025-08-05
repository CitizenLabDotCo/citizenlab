# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::IdeaMarkedAsSpamMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::IdeaMarkedAsSpam.create! }
    let_it_be(:initiating_user) { create(:user, first_name: 'Monty', last_name: 'McMonty') }
    let_it_be(:idea) { create(:idea, author: recipient) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          idea_created_at: idea.created_at.iso8601,
          idea_title_multiloc: idea.title_multiloc,
          idea_author_name: idea.author_name,
          idea_url: Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient.locale)),
          spam_report_reason_code: 'wrong_content',
          spam_report_other_reason: nil
        }
      }
    end

    let_it_be(:mailer) { described_class.with(command: command, campaign: campaign) }
    let_it_be(:mail) { mailer.campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    include_examples 'campaign delivery tracking'

    it 'renders the subject' do
      expect(mail.subject).to start_with('You have a spam report on the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns reporter\'s name' do
      expect(mail_body(mail)).to include(initiating_user.first_name)
    end

    it 'assigns the reason' do
      expect(mail_body(mail)).to include('This content is not relevant and does not belong here.')
    end

    it 'assigns go to idea CTA' do
      idea_url = Frontend::UrlService.new.model_to_url(idea, locale: Locale.new(recipient.locale))
      expect(mail_body(mail)).to include(idea_url)
    end

    context 'with custom text' do
      let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

      before do
        campaign.update!(
          subject_multiloc: { 'en' => 'Custom Subject - {{ organizationName }}' },
          title_multiloc: { 'en' => 'NEW TITLE FOR {{ firstName }} {{ lastName }}' },
          button_text_multiloc: { 'en' => 'CLICK THE BUTTON' }
        )
      end

      it 'can customise the subject' do
        expect(mail.subject).to eq 'Custom Subject - Liege'
      end

      it 'can customise the title' do
        expect(mail_body(mail)).to include('NEW TITLE FOR Monty McMonty')
      end

      it 'can customise the cta button' do
        expect(mail_body(mail)).to include('CLICK THE BUTTON')
      end
    end
  end
end
