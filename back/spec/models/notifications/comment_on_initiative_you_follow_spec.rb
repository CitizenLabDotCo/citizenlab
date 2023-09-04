# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::CommentOnInitiativeYouFollow do
  describe 'make_notifications_on' do
    it 'makes a notification on created comment activity' do
      initiative = create(:initiative)
      follower = create(:follower, followable: initiative)
      comment = create(:comment, post: initiative)
      activity = create(:activity, item: comment, action: 'created')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: follower.user_id,
        initiating_user_id: comment.author_id,
        post_id: initiative.id,
        comment_id: comment.id
      )
    end
  end
end
