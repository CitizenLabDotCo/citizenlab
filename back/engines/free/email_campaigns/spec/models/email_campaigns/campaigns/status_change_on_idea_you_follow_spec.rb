# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::StatusChangeOnIdeaYouFollow do
  describe 'StatusChangeOnIdeaYouFollow campaign default factory' do
    it 'is valid' do
      expect(build(:status_change_on_idea_you_follow_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let_it_be(:campaign, reload: true) { create(:status_change_on_idea_you_follow_campaign) }
    let_it_be(:notification, reload: true) { create(:status_change_on_idea_you_follow) }
    let_it_be(:notification_activity, reload: true) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command).to match({
        event_payload: hash_including(
          idea_title_multiloc: notification.idea.title_multiloc,
          idea_url: an_instance_of(String),
          idea_status_title_multiloc: notification.idea_status.title_multiloc
        )
      })
    end
  end
end
