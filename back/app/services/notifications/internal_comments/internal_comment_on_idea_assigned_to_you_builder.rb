# frozen_string_literal: true

module Notifications
  class InternalComments::InternalCommentOnIdeaAssignedToYouBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? ||
        initiator_id == recipient.id ||
        recipient.id == parent_author_id ||
        MentionService.new.user_mentioned?(internal_comment.body, recipient)
    end

    def recipients
      [User.find_by(id: internal_comment&.idea&.assignee_id)].compact
    end

    def preconditions_met?
      true
    end

    def notification_class
      Notifications::InternalComments::InternalCommentOnIdeaAssignedToYou
    end
  end
end
