# frozen_string_literal: true

module Notifications
  class InternalComments::InternalCommentOnUnassignedUnmoderatedIdeaBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? ||
        initiator_id == recipient.id ||
        recipient.id == parent_author_id ||
        recipient.id == assignee_id ||
        MentionService.new.user_mentioned?(internal_comment.body, recipient) ||
        (!recipient.admin? && UserRoleService.new.can_moderate?(internal_comment.post.project, recipient))
    end

    def recipients
      commenters = InternalComment.where(post_id: internal_comment.post_id).map(&:author).uniq

      User.admin - commenters
    end

    def preconditions_met?
        assignee_id.nil? &&
        User.project_moderator(project_id).empty? &&
        User.project_folder_moderator(folder_id).empty?
    end

    def notification_class
      Notifications::InternalComments::InternalCommentOnUnassignedUnmoderatedIdea
    end
  end
end
