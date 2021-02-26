require 'rails_helper'

RSpec.describe EmailCampaigns::CommentMarkedAsSpamMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::CommentMarkedAsSpam.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }
    
    let(:initiating_user) { create(:user) }
    let!(:comment) { create(:comment, author: recipient) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          initiating_user_first_name: initiating_user&.first_name,
          initiating_user_last_name: initiating_user&.last_name,
          post_title_multiloc: comment.post.title_multiloc,
          post_type: comment.post_type,
          comment_author_name: comment.author_name,
          comment_body_multiloc: comment.body_multiloc,
          comment_url: Frontend::UrlService.new.model_to_url(comment, locale: recipient.locale),
          spam_report_reason_code: 'inappropriate',
          spam_report_other_reason: nil
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end


    it 'renders the subject' do
      expect(mail.subject).to end_with('reported this comment as spam')
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
      expect(mail.body.encoded).to match('The comment is inappropriate or offensive.')
    end

    it 'assigns go to comment CTA' do
      comment_url = Frontend::UrlService.new.model_to_url(comment, locale: recipient.locale)
      expect(mail.body.encoded).to match(comment_url)
    end
  end
end
