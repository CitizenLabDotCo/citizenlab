# frozen_string_literal: true

module Notifications
  class InternalComments::InternalCommentOnUnassignedInitiativeBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? ||
        initiator_id == recipient.id ||
        recipient.id == parent_author_id ||
        recipient.id == assignee_id ||
        MentionService.new.user_mentioned?(internal_comment.body, recipient)
    end

    def recipients
      commenters = InternalComment.where(post_id: internal_comment.post_id).map(&:author).uniq

      User.admin - commenters
    end

    def preconditions_met?
      post_type == 'Initiative' && assignee_id.nil?
    end

    def notification_class
      Notifications::InternalComments::InternalCommentOnUnassignedInitiative
    end
  end
end
