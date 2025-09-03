# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Notifications::CommentOnIdeaYouFollow do
  describe 'make_notifications_on' do
    it 'makes a notification on created comment activity' do
      idea = create(:idea)
      follower = create(:follower, followable: idea)
      comment = create(:comment, idea: idea)
      activity = create(:activity, item: comment, action: 'created')

      notifications = described_class.make_notifications_on activity
      expect(notifications.first).to have_attributes(
        recipient_id: follower.user_id,
        initiating_user_id: comment.author_id,
        idea_id: idea.id,
        comment_id: comment.id,
        project_id: comment.idea.project_id
      )
    end

    it 'does not make a notification when follow feature is turned off' do
      idea = create(:idea)
      create(:follower, followable: idea)
      comment = create(:comment, idea: idea)
      activity = create(:activity, item: comment, action: 'created')

      SettingsService.new.deactivate_feature! 'follow'
      notifications = described_class.make_notifications_on activity
      expect(notifications).to be_empty
    end
  end
end
