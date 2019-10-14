module Notifications
  class CommentDeletedByAdmin < Notification

    REASON_CODES = %w(irrelevant inappropriate other)

    validates :comment, :post, presence: true
    validates :reason_code, inclusion: { in: REASON_CODES }, presence: true


    ACTIVITY_TRIGGERS = {'Comment' => {'marked_as_deleted' => true}}
    EVENT_NAME = 'Comment deleted by admin'
    

    def self.make_notifications_on activity
      comment = activity.item
      recipient_id = comment&.author_id
      initiator_id = activity.user_id

      if recipient_id && (recipient_id != initiator_id)
        attributes = {
          recipient_id: recipient_id,
          initiating_user_id: initiator_id,
          comment_id: comment.id,
          post_id: comment.post_id,
          post_type: comment.post_type,
          reason_code: activity.payload['reason_code'],
          other_reason: activity.payload['other_reason'],
        }
        if attributes[:post_type] == 'Idea'
          attributes[:project_id] = comment.post.project_id
        end
        [self.new(attributes)]
      else
        []
      end
    end

  end
end

