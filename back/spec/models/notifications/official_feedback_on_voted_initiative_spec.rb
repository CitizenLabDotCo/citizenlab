# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnVotedInitiative do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each user that voted on the initiative' do
      initiative = create(:initiative)
      vote1 = create(:vote, votable: initiative)
      vote2 = create(:vote, votable: initiative)
      create(:vote)

      official_feedback = create(:official_feedback, post: initiative)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications.map(&:recipient)).to match_array [vote1.user, vote2.user]
    end
  end
end
