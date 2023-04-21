# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::OfficialFeedbackOnCommentedInitiative do
  describe 'make_notifications_on' do
    it 'generates exactly one notification for each user that commented on the initiative' do
      initiative = create(:initiative)
      comment1 = create(:comment, post: initiative)
      comment2 = create(:comment, post: initiative)
      create(:comment, post: initiative, author: comment2.author)
      create(:comment)

      official_feedback = create(:official_feedback, post: initiative)
      activity = create(:activity, item: official_feedback, action: :created)

      notifications = subject.class.make_notifications_on(activity)
      expect(notifications.map(&:recipient)).to match_array [comment1.author, comment2.author]
    end
  end
end
