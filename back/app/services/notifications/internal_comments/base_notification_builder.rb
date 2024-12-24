# frozen_string_literal: true

module Notifications
  class InternalComments::BaseNotificationBuilder
    def initialize(activity)
      @activity = activity
    end

    def build_notifications
      return [] unless preconditions_met?

      recipients.filter_map do |recipient|
        next if skip_recipient?(recipient)

        notification_class.new(
          recipient_id: recipient.id,
          initiating_user_id: initiator_id,
          internal_comment: internal_comment,
          idea: internal_comment.post,
          project_id: idea.project_id
        )
      end
    end

    private

    def preconditions_met?
      true
    end

    def internal_comment
      @activity.item
    end

    def initiator_id
      internal_comment&.author_id
    end

    def assignee_id
      idea&.assignee_id
    end

    def parent_author_id
      internal_comment&.parent&.author_id
    end

    def idea
      internal_comment.post
    end

    def project_id
      idea&.project_id
    end

    def folder_id
      idea&.project&.folder_id
    end
  end
end
