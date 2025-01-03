# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::CommentDeletedByAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::CommentDeletedByAdmin.create! }
    let_it_be(:comment) { create(:comment) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          comment_created_at: comment.created_at&.iso8601,
          comment_body_multiloc: comment.body_multiloc,
          reason_code: 'other',
          other_reason: "I don't tolerate criticism",
          idea_url: Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale))
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

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
      comment_url = Frontend::UrlService.new.model_to_url(comment, locale: Locale.new(recipient.locale))
      expect(mail.body.encoded).to match(comment_url)
    end
  end
end
