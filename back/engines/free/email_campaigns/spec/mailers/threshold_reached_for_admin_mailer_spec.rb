# frozen_string_literal: true

require 'rails_helper'

# TODO: move-old-proposals-test
RSpec.describe EmailCampaigns::ThresholdReachedForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:assignee) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ThresholdReachedForAdmin.create! }
    let_it_be(:proposal) { create(:proposal, assignee: assignee) }
    let_it_be(:notification) { create(:threshold_reached_for_admin, recipient: recipient, post: proposal) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_title_multiloc: notification.post.title_multiloc,
          post_body_multiloc: notification.post.body_multiloc,
          post_published_at: notification.post.published_at.iso8601,
          post_author_name: notification.post.author_name,
          post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: Locale.new(recipient.locale)),
          post_likes_count: notification.post.likes_count,
          post_comments_count: notification.post.comments_count,
          assignee_first_name: notification.post.assignee.first_name,
          assignee_last_name: notification.post.assignee.last_name
        }
      }
    end

    let_it_be(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    before_all { EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id) }

    it 'renders the subject' do
      expect(mail.subject).to start_with('An initiative reached the voting threshold on your platform')
    end

    it 'renders the sender email' do
      expect(mail.from).to all(end_with('@citizenlab.co'))
    end

    it 'assigns organisation name' do
      expect(mail.body.encoded).to match(AppConfiguration.instance.settings('core', 'organization_name', 'en'))
    end

    it 'assigns cta url' do
      expect(mail.body.encoded).to match(command.dig(:event_payload, :post_url))
    end
  end
end
