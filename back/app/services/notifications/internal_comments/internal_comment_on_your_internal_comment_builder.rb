# frozen_string_literal: true

module Notifications
  class InternalComments::InternalCommentOnYourInternalCommentBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? ||
        initiator_id == recipient.id ||
        MentionService.new.user_mentioned?(internal_comment.body, recipient)
    end

    def recipients
      [User.find(internal_comment&.parent&.author_id)]
    end

    def notification_class
      Notifications::InternalComments::InternalCommentOnYourInternalComment
    end
  end
end
