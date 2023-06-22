# frozen_string_literal: true

module Notifications
  class InternalComments::MentionInInternalCommentBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? || initiator_id == recipient.id
    end

    def recipients
      [User.find(@activity.payload['mentioned_user'])]
    end

    def notification_class
      Notifications::InternalComments::MentionInInternalComment
    end
  end
end
