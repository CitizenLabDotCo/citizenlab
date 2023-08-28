# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::OfficialFeedbackOnIdeaYouFollow do
  describe 'OfficialFeedbackOnIdeaYouFollow campaign default factory' do
    it 'is valid' do
      expect(build(:official_feedback_on_idea_you_follow_campaign)).to be_valid
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:official_feedback_on_idea_you_follow_campaign) }
    let(:notification) { create(:official_feedback_on_idea_you_follow) }
    let(:notification_activity) { create(:activity, item: notification, action: 'created') }

    it 'generates a command with the desired payload and tracked content' do
      command = campaign.generate_commands(
        recipient: notification_activity.item.recipient,
        activity: notification_activity
      ).first

      expect(command).to match({
        event_payload: hash_including(
          official_feedback_author_multiloc: notification.official_feedback.author_multiloc,
          official_feedback_body_multiloc: notification.official_feedback.body_multiloc,
          official_feedback_url: an_instance_of(String),
          post_published_at: an_instance_of(String),
          post_title_multiloc: notification.post.title_multiloc,
          post_author_name: notification.post.author_name
        )
      })
    end
  end
end
