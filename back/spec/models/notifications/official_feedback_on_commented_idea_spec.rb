# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnCommentedIdea do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each user that commented on the idea' do
      idea = create(:idea)
      comment1 = create(:comment, post: idea)
      comment2 = create(:comment, post: idea)
      create(:comment, post: idea, author: comment2.author)
      create(:comment)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications.map(&:recipient)).to match_array [comment1.author, comment2.author]
    end

    it "doesn't generate (invalid) notifications for comments attributed to a deleted user" do
      idea = create(:idea)
      comment = create(:comment, post: idea)
      comment.author.destroy!

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end

    it "doesn't generate notifications for the idea author" do
      idea = create(:idea)
      create(:comment, post: idea, author: idea.author)

      official_feedback = create(:official_feedback, post: idea)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications).to eq []
    end
  end
end
