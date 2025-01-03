# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::StatusChangeOnIdeaYouFollow do
  describe 'StatusChangeOnIdeaYouFollow campaign default factory' do
    it 'is valid' do
      expect(build(:status_change_on_idea_you_follow_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:status_change_on_idea_you_follow_campaign) }
    let(:notification) { create(:status_change_on_idea_you_follow) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command).to match({
        event_payload: hash_including(
          idea_id: notification.idea.id,
          idea_title_multiloc: notification.idea.title_multiloc,
          idea_body_multiloc: notification.idea.body_multiloc,
          idea_url: an_instance_of(String),
          idea_images: an_instance_of(Array),
          idea_status_id: notification.idea_status.id,
          idea_status_title_multiloc: notification.idea_status.title_multiloc,
          idea_status_code: notification.idea_status.code,
          idea_status_color: notification.idea_status.color
        )
      })
    end
  end
end
