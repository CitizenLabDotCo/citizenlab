# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalComments::MentionInInternalComment do
  describe 'make_notifications_on' do
    it 'makes a notification on mentioned in internal comment on idea activity' do
      internal_comment = create(:internal_comment)
      user = create(:user)
      activity = create(:activity, item: internal_comment, action: 'mentioned', payload: { mentioned_user: user.id })

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: user.id,
        initiating_user_id: internal_comment.author_id,
        internal_comment_id: internal_comment.id,
        idea_id: internal_comment.idea_id,
        project_id: internal_comment.idea.project_id
      )
    end

    it 'does not make a notification on when the recipient is the internal comment author' do
      user = create(:user)
      internal_comment = create(:internal_comment, author: user)
      notifications_count = described_class.count
      activity = create(:activity, item: internal_comment, action: 'mentioned', payload: { mentioned_user: user.id })
      notifications = described_class.make_notifications_on activity

      expect(notifications.count).to eq notifications_count
    end
  end
end
