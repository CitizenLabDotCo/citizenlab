require 'rails_helper'

RSpec.describe EmailCampaigns::ThresholdReachedForAdminMailer, type: :mailer do
  describe 'campaign_mail' do
    let!(:recipient) { create(:user, locale: 'en') }
    let!(:assignee) { create(:admin, locale: 'en') }
    let!(:campaign) { EmailCampaigns::Campaigns::ThresholdReachedForAdmin.create! }
    let!(:initiative) { create(:initiative, assignee: assignee) }
    let!(:notification) { create(:threshold_reached_for_admin, recipient: recipient, post: initiative) }
    let(:mail) { described_class.with(command: command, campaign: campaign).campaign_mail.deliver_now }

    let(:command) do
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
          post_images: notification.post.initiative_images.map{ |image|
            {
              ordering: image.ordering,
              versions: image.image.versions.map{|k, v| [k.to_s, v.url]}.to_h
            }
          },
          initiative_header_bg: {
            versions: notification.post.header_bg.versions.map{|k, v| [k.to_s, v.url]}.to_h
          },
          assignee_first_name: notification.post.assignee.first_name,
          assignee_last_name: notification.post.assignee.last_name
        }
      }
    end

    before do
      EmailCampaigns::UnsubscriptionToken.create!(user_id: recipient.id)
    end

    let(:mail_document) { Nokogiri::HTML.fragment(mail.body.encoded) }

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
