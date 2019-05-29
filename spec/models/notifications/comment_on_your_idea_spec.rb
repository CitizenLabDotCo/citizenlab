require 'rails_helper'

RSpec.describe Notifications::CommentOnYourIdea, type: :model do

  describe "make_notifications_on" do
    it "makes a notification on created comment activity" do
      comment = create(:comment)
      activity = create(:activity, item: comment, action: 'created')

      Notifications::CommentOnYourIdea.make_notifications_on activity
      notification = Notification.first
      expect(notification).to have_attributes(
        recipient_id: comment.idea.author_id,
        initiating_user_id: comment.author_id,
        idea_id: comment.post_id,
        comment_id: comment.id,
        project_id: comment.post.project_id
      )
    end
  end
end