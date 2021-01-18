require 'rails_helper'

RSpec.describe EmailCampaigns::IdeaMarkedAsSpamMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::IdeaMarkedAsSpam.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    
    let(:initiating_user) { create(:user) }
    let!(:idea) { create(:idea, author: recipient) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          post_created_at: idea.created_at.iso8601,
          post_title_multiloc: idea.title_multiloc,
          post_author_name: idea.author_name,
          post_url: Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale),
          spam_report_reason_code: 'wrong_content',
          spam_report_other_reason: nil
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end


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
      expect(mail.body.encoded).to match(initiating_user.first_name)
    end

    it 'assigns the reason' do
      expect(mail.body.encoded).to match('This content is not an idea and does not belong here.')
    end

    it 'assigns go to idea CTA' do
      idea_url = Frontend::UrlService.new.model_to_url(idea, locale: recipient.locale)
      expect(mail.body.encoded).to match(idea_url)
    end
  end
end
