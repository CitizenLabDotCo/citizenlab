module Notifications
  class CommentOnYourInitiative < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :initiative
    belongs_to :project, optional: true

    validates :comment_id, presence: true
    validates :initiating_user, presence: true
    validates :initiative_id, presence: true


    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'Comment on your initiative'
    

    def self.make_notifications_on activity
      comment = activity.item
      recipient_id = comment.post&.author_id
      initiator_id = comment&.author_id

      if (comment.post_type == 'Initiative') && recipient_id && initiator_id && (recipient_id != initiator_id)
        [self.create(
           recipient_id: recipient_id,
           initiating_user_id: initiator_id,
           initiative: comment.post,
           comment_id: comment.id
         )]
      else
        []
      end
    end

  end
end

