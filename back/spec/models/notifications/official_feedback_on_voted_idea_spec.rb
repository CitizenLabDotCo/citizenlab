# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnVotedIdea do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each user that voted on the idea' do
      idea = create(:idea)
      vote1 = create(:vote, votable: idea)
      vote2 = create(:vote, votable: idea)
      create(:vote)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications.map(&:recipient)).to match_array [vote1.user, vote2.user]
    end

    it "doesn't generate (invalid) notifications for votes attributed to a deleted user" do
      idea = create(:idea)
      vote = create(:vote, votable: idea)
      vote.user.destroy!

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end

    it "doesn't generate notifications for the idea author" do
      idea = create(:idea)
      create(:vote, votable: idea, user: idea.author)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end

    it "doesn't generate notifications for commenters" do
      idea = create(:idea)
      comment = create(:comment, post: idea)
      create(:vote, votable: idea, user: comment.author)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end
  end
end
