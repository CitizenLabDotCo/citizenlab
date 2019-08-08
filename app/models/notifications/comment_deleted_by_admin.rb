module Notifications
  class CommentDeletedByAdmin < Notification

    REASON_CODES = %w(irrelevant inappropriate other)

    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :initiative, optional: true
    belongs_to :idea, optional: true
    belongs_to :project, optional: true

    validates :comment, presence: true
    validates :initiating_user, presence: true
    validates :reason_code, inclusion: { in: REASON_CODES }, presence: true


    ACTIVITY_TRIGGERS = {'Comment' => {'marked_as_deleted' => true}}
    EVENT_NAME = 'Comment deleted by admin'
    

    def self.make_notifications_on activity
      comment = activity.item
      post = comment.post
      recipient_id = comment&.author_id
      initiator_id = activity.user_id

      if recipient_id && initiator_id && (recipient_id != initiator_id)
        post_attributes = case comment.post_type
        when 'Idea'
          {
            idea: comment.post,
            project_id: comment.post.project_id
          }
        when 'Initiative'
          {
            initiative_id: comment.post_id
          }
        else
          raise "Unsupported post type #{comment.post_type}"
        end
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: initiator_id,
           comment_id: comment.id,
           reason_code: activity.payload["reason_code"],
           other_reason: activity.payload["other_reason"],
           **post_attributes
         )]
      else
        []
      end
    end

  end
end

