module Notifications
  class CommentOnYourComment < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :post, polymorphic: true
    belongs_to :initiative, optional: true
    belongs_to :project, optional: true

    validates :initiating_user, :comment, presence: true

    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'Comment on your comment'


    def self.make_notifications_on activity
      comment = activity.item
      recipient_id = comment.parent&.author_id
      initiator_id = comment&.author_id

      if comment.parent_id && recipient_id && initiator_id && (recipient_id != initiator_id)
        attributes = {
          recipient_id: recipient_id,
          initiating_user_id: initiator_id,
          comment: comment,
          post_id: comment.post_id,
          post_type: comment.post_type
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