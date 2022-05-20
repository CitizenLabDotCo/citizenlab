# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::StatusChangeOfYourIdea, type: :model do
  describe 'StatusChangeOfYourIdea Campaign default factory' do
    it 'is valid' do
      expect(build(:status_change_of_your_idea_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:status_change_of_your_idea_campaign) }
    let(:notification) { create(:status_change_of_your_idea) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(
        command.dig(:event_payload, :idea_status_id)
      ).to eq(notification.post_status.id)
    end
  end
end
