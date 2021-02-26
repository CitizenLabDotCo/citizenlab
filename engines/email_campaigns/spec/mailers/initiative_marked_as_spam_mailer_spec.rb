require 'rails_helper'

RSpec.describe EmailCampaigns::InitiativeMarkedAsSpamMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::InitiativeMarkedAsSpam.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    
    let(:initiating_user) { create(:user) }
    let!(:initiative) { create(:initiative, author: recipient) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          post_created_at: initiative.created_at.iso8601,
          post_title_multiloc: initiative.title_multiloc,
          post_author_name: initiative.author_name,
          post_url: Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale),
          initiative_votes_needed: initiative.votes_needed,
          initiative_expires_at: initiative.expires_at.iso8601,
          spam_report_reason_code: 'other',
          spam_report_other_reason: 'This post is an intrusion to my privacy'
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
      expect(mail.body.encoded).to match('This post is an intrusion to my privacy')
    end

    it 'assigns go to initiative CTA' do
      initiative_url = Frontend::UrlService.new.model_to_url(initiative, locale: recipient.locale)
      expect(mail.body.encoded).to match(initiative_url)
    end
  end
end
