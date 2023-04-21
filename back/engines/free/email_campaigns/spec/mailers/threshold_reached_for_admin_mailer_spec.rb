# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ThresholdReachedForAdminMailer do
  describe 'campaign_mail' do
    let_it_be(:recipient) { create(:user, locale: 'en') }
    let_it_be(:assignee) { create(:admin, locale: 'en') }
    let_it_be(:campaign) { EmailCampaigns::Campaigns::ThresholdReachedForAdmin.create! }
    let_it_be(:initiative) { create(:initiative, assignee: assignee) }
    let_it_be(:notification) { create(:threshold_reached_for_admin, recipient: recipient, post: initiative) }
    let_it_be(:command) do
      {
        recipient: recipient,
        event_payload: {
          post_title_multiloc: notification.post.title_multiloc,
          post_body_multiloc: notification.post.body_multiloc,
          post_published_at: notification.post.published_at.iso8601,
          post_author_name: notification.post.author_name,
          post_url: Frontend::UrlService.new.model_to_url(notification.post, locale: recipient.locale),
          post_upvotes_count: notification.post.upvotes_count,
          post_comments_count: notification.post.comments_count,
          post_images: notification.post.initiative_images.map do |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.to_h { |k, v| [k.to_s, v.url] }
            }
          end,
          initiative_header_bg: {
            versions: notification.post.header_bg.versions.to_h { |k, v| [k.to_s, v.url] }
          },
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
