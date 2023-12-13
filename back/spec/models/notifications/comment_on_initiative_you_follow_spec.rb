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

    it 'does not make a notification when follow feature is turned off' do
      initiative = create(:initiative)
      create(:follower, followable: initiative)
      comment = create(:comment, post: initiative)
      activity = create(:activity, item: comment, action: 'created')

      SettingsService.new.deactivate_feature! 'follow'
      notifications = described_class.make_notifications_on activity
      expect(notifications).to be_empty
    end
  end
end
