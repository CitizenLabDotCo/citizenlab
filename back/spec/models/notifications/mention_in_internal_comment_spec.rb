# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::MentionInInternalComment do
  describe 'make_notifications_on' do
    it 'makes a notification on mentioned in internal comment activity' do
      internal_comment = create(:internal_comment)
      user = create(:user)
      activity = create(:activity, item: internal_comment, action: 'mentioned', payload: { mentioned_user: user.id })

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: user.id,
        initiating_user_id: internal_comment.author_id,
        post_id: internal_comment.post_id,
        internal_comment_id: internal_comment.id,
        project_id: internal_comment.post.project_id
      )
    end
  end
end
