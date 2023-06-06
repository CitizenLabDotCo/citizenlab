# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnVotedIdea do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each user that reacted to the idea' do
      idea = create(:idea)
      reaction1 = create(:reaction, reactable: idea)
      reaction2 = create(:reaction, reactable: idea)
      create(:reaction)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications.map(&:recipient)).to match_array [reaction1.user, reaction2.user]
    end

    it "doesn't generate (invalid) notifications for reactions attributed to a deleted user" do
      idea = create(:idea)
      reaction = create(:reaction, reactable: idea)
      reaction.user.destroy!

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end

    it "doesn't generate notifications for the idea author" do
      idea = create(:idea)
      create(:reaction, reactable: idea, user: idea.author)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end

    it "doesn't generate notifications for commenters" do
      idea = create(:idea)
      comment = create(:comment, post: idea)
      create(:reaction, reactable: idea, user: comment.author)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end
  end
end
