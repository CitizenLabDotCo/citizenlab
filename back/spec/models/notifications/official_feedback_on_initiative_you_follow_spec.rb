# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnInitiativeYouFollow do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each follower of the initiative' do
      initiative = create(:initiative)
      follower1 = create(:follower, followable: initiative)
      create(:follower)
      follower3 = create(:follower, followable: initiative)

      official_feedback = create(:official_feedback, post: initiative)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = described_class.make_notifications_on(activity)
      expect(notifications.map(&:recipient_id)).to contain_exactly follower1.user_id, follower3.user_id
    end

    it "doesn't generate notifications for the initiating user" do
      initiative = create(:initiative)
      follower = create(:follower, followable: initiative)

      official_feedback = create(:official_feedback, post: initiative, user: follower.user)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = described_class.make_notifications_on(activity)
      expect(notifications).to eq []
    end

    it "doesn't generate notifications when there was a status change for the same official feedback" do
      initiative = create(:initiative)
      create(:follower, followable: initiative)
      official_feedback = create(:official_feedback, post: initiative)
      create(:initiative_status_change, initiative: initiative, official_feedback: official_feedback)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = described_class.make_notifications_on(activity)
      expect(notifications).to eq []
    end
  end
end
