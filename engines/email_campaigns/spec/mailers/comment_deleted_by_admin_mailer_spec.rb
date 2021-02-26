require 'rails_helper'

RSpec.describe EmailCampaigns::CommentDeletedByAdminMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::CommentDeletedByAdmin.create! }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let!(:comment) { create(:comment) }

    let(:command) do
      {
        recipient: recipient,
        event_payload: {
          comment_created_at: comment.created_at&.iso8601,
          comment_body_multiloc: comment.body_multiloc,
          reason_code: 'other',
          other_reason: "I don't tolerate criticism",
          post_type: comment.post_type,
          post_url: Frontend::UrlService.new.model_to_url(comment.post, locale: recipient.locale)
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end


    it 'renders the subject' do
      expect(mail.subject).to start_with('Your comment has been deleted from the platform of')
    end

    it 'renders the receiver email' do
      expect(mail.to).to eq([recipient.email])
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns the reason' do
      expect(mail.body.encoded).to match('I don\'t tolerate criticism')
    end

    it 'assigns go to post CTA' do
      post_url = Frontend::UrlService.new.model_to_url(comment.post, locale: recipient.locale)
      expect(mail.body.encoded).to match(post_url)
    end
  end
end
