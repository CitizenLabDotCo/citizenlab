# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::MentionInInternalComment do
  describe 'MentionInInternalComment Campaign default factory' do
    it 'is valid' do
      expect(build(:mention_in_internal_comment_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:mention_in_internal_comment_campaign) }
    let(:notification) { create(:mention_in_internal_comment) }
    let!(:idea_image) { create(:idea_image, idea: notification.post) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }
    let(:recipient) { notification_activity.item.recipient }
    let(:name_service) { UserDisplayNameService.new(AppConfiguration.instance, recipient) }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: recipient,
        activity: notification_activity
      ).first

      expect(
        command.dig(:event_payload, :initiating_user_first_name)
      ).to eq(notification.initiating_user.first_name)
      expect(
        command.dig(:event_payload, :initiating_user_last_name)
      ).to eq(notification.initiating_user.last_name)
      expect(
        command.dig(:event_payload, :internal_comment_author_name)
      ).to eq(name_service.display_name!(notification.internal_comment.author))
      expect(
        command.dig(:event_payload, :internal_comment_body)
      ).to eq(notification.internal_comment.body)
      expect(
        command.dig(:event_payload, :internal_comment_url)
      ).to eq(Frontend::UrlService.new.model_to_url(notification.internal_comment, locale: recipient.locale))
      expect(
        command.dig(:event_payload, :post_title_multiloc)
      ).to eq(notification.post.title_multiloc)
      expect(
        command.dig(:event_payload, :post_body_multiloc)
      ).to eq(notification.post.body_multiloc)
      expect(
        command.dig(:event_payload, :post_type)
      ).to eq(notification.post_type)
      expect(
        command.dig(:event_payload, :post_image_medium_url)
      ).to eq(idea_image.image.versions[:medium].url)
    end
  end
end
