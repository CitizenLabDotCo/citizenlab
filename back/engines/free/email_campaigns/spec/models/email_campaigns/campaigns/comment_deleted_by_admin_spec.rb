# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentDeletedByAdmin do
  describe 'CommentDeletedByAdmin Campaign default factory' do
    it 'is valid' do
      expect(build(:comment_deleted_by_admin_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:comment_deleted_by_admin_campaign) }
    let(:notification) { create(:comment_deleted_by_admin) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(
        command.dig(:event_payload, :initiating_user_id)
      ).to be_blank
      expect(
        command.dig(:event_payload, :comment_created_at)
      ).to eq(notification.comment.created_at.iso8601)
    end
  end
end
