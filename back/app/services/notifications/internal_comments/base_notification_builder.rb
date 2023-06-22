# frozen_string_literal: true

module Notifications
  class InternalComments::BaseNotificationBuilder
    delegate :post_type, to: :internal_comment

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
          post_id: internal_comment.post_id,
          post_type: post_type,
          project_id: post.respond_to?(:project_id) ? post.project_id : nil
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

    def parent_author_id
      internal_comment&.parent&.author_id
    end

    def post
      internal_comment.post
    end
  end
end
