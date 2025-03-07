# frozen_string_literal: true

module Notifications
  class InternalComments::InternalCommentOnIdeaYouCommentedInternallyOnBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? ||
        initiator_id == recipient.id ||
        recipient.id == parent_author_id ||
        recipient.id == assignee_id ||
        MentionService.new.user_mentioned?(internal_comment.body, recipient) ||
        (!recipient.admin? && UserRoleService.new.can_moderate?(internal_comment.idea.project, recipient))
    end

    def recipients
      InternalComment.where(idea_id: internal_comment.idea_id).map(&:author).uniq
    end

    def preconditions_met?
      true
    end

    def notification_class
      Notifications::InternalComments::InternalCommentOnIdeaYouCommentedInternallyOn
    end
  end
end
