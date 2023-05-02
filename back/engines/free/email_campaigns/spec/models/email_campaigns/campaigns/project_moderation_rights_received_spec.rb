# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::ProjectModerationRightsReceived do
  describe 'ProjectModerationRightsReceived Campaign default factory' do
    it 'is valid' do
      expect(build(:project_moderation_rights_received_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:project_moderation_rights_received_campaign) }
    let(:notification) { create(:project_moderation_rights_received) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(
        command.dig(:event_payload, :project_ideas_count)
      ).to eq(notification.project.ideas_count)
    end
  end
end
