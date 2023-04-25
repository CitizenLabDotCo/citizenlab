# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::CommentOnYourIdea do
  describe 'make_notifications_on' do
    it 'makes a notification on created comment activity' do
      comment = create(:comment, post: create(:idea))
      activity = create(:activity, item: comment, action: 'created')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: comment.post.author_id,
        initiating_user_id: comment.author_id,
        post_id: comment.post_id,
        comment_id: comment.id,
        project_id: comment.post.project_id
      )
    end
  end
end
