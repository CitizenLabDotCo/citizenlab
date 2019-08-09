require 'rails_helper'

RSpec.describe Notifications::MentionInComment, type: :model do

  describe "make_notifications_on" do
    it "makes a notification on mentioned comment activity" do
      comment = create(:comment)
      user = create(:user)
      activity = create(:activity, item: comment, action: 'mentioned', payload: {mentioned_user: user.id})

      notifications = Notifications::MentionInComment.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: user.id,
        initiating_user_id: comment.author_id,
        idea_id: comment.idea_id,
        comment_id: comment.id,
        project_id: comment.idea.project_id
      )
    end
  end
end