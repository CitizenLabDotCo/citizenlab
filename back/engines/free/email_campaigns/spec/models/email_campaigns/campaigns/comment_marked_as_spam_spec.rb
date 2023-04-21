# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::CommentMarkedAsSpam do
  describe 'CommentMarkedAsSpam Campaign default factory' do
    it 'is valid' do
      expect(build(:comment_marked_as_spam_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:comment_marked_as_spam_campaign) }
    let(:notification) { create(:comment_marked_as_spam) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(
        command.dig(:event_payload, :initiating_user_last_name)
      ).to eq(notification.initiating_user.last_name)
      expect(
        command.dig(:event_payload, :spam_report_reason_code)
      ).to eq(notification.spam_report.reason_code)
    end
  end
end
