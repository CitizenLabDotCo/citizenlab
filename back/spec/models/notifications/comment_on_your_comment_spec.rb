# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::CommentOnYourComment, type: :model do
  describe 'make_notifications_on' do
    it 'makes a notification on created comment activity' do
      idea = create(:idea)
      parent_comment = create(:comment, post: idea)
      child_comment = create(:comment, parent: parent_comment, post: idea)
      activity = create(:activity, item: child_comment, action: 'created')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: parent_comment.author_id,
        initiating_user_id: child_comment.author_id,
        post_id: parent_comment.post_id,
        comment_id: child_comment.id,
        project_id: parent_comment.post.project_id
      )
    end
  end
end
