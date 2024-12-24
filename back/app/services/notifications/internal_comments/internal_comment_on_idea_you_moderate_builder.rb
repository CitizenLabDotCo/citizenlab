# frozen_string_literal: true

module Notifications
  class InternalComments::InternalCommentOnIdeaYouModerateBuilder < InternalComments::BaseNotificationBuilder
    protected

    def skip_recipient?(recipient)
      initiator_id.nil? ||
        initiator_id == recipient.id ||
        recipient.id == parent_author_id ||
        recipient.id == assignee_id ||
        MentionService.new.user_mentioned?(internal_comment.body, recipient)
    end

    def recipients
      moderators = User.project_moderator(project_id)
      moderators += User.project_folder_moderator(folder_id) if folder_id

      moderators.uniq
    end

    def preconditions_met?
      true
    end

    def notification_class
      Notifications::InternalComments::InternalCommentOnIdeaYouModerate
    end
  end
end
