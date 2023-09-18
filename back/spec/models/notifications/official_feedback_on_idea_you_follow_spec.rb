# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnIdeaYouFollow do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each follower of the idea' do
      idea = create(:idea)
      follower1 = create(:follower, followable: idea)
      create(:follower)
      follower3 = create(:follower, followable: idea)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = described_class.make_notifications_on(activity)
      expect(notifications.map(&:recipient_id)).to contain_exactly follower1.user_id, follower3.user_id
    end

    it "doesn't generate notifications for the initiating user" do
      idea = create(:idea)
      follower = create(:follower, followable: idea)

      official_feedback = create(:official_feedback, post: idea, user: follower.user)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = described_class.make_notifications_on(activity)
      expect(notifications).to eq []
    end
  end
end
