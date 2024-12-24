# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::MentionInComment do
  describe 'make_notifications_on' do
    it 'makes a notification on mentioned in comment activity' do
      comment = create(:comment)
      user = create(:user)
      activity = create(:activity, item: comment, action: 'mentioned', payload: { mentioned_user: user.id })

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: user.id,
        initiating_user_id: comment.author_id,
        idea_id: comment.post_id,
        comment_id: comment.id,
        project_id: comment.post.project_id
      )
    end
  end
end
