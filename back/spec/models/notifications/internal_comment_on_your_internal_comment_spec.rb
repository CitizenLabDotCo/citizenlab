# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::InternalCommentOnYourInternalComment do
  describe 'make_notifications_on' do
    it 'makes a notification on created internal comment activity' do
      idea = create(:idea)
      parent_internal_comment = create(:internal_comment, post: idea)
      child_internal_comment = create(:internal_comment, parent: parent_internal_comment, post: idea)
      activity = create(:activity, item: child_internal_comment, action: 'created')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: parent_internal_comment.author_id,
        initiating_user_id: child_internal_comment.author_id,
        post_id: parent_internal_comment.post_id,
        internal_comment_id: child_internal_comment.id,
        project_id: parent_internal_comment.post.project_id
      )
    end
  end
end
