# frozen_string_literal: true

module Notifications
  class InternalComments::InternalCommentOnInitiativeAssignedToYouBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? ||
        initiator_id == recipient.id ||
        recipient.id == parent_author_id ||
        MentionService.new.user_mentioned?(internal_comment.body, recipient)
    end

    def recipients
      [User.find(internal_comment&.post&.assignee_id)]
    end

    def preconditions_met?
      post_type == 'Initiative'
    end

    def notification_class
      Notifications::InternalComments::InternalCommentOnInitiativeAssignedToYou
    end
  end
end
