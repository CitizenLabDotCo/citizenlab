module Notifications
  class CommentDeletedByAdmin < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :idea
    belongs_to :project, optional: true

    validates :comment_id, presence: true
    validates :initiating_user, presence: true
    validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'Comment' => {'marked_as_deleted' => true}}
    EVENT_NAME = 'Comment deleted by admin'
    

    def self.make_notifications_on activity
      comment = activity.item
      recipient_id = comment&.author_id

      comment_id = comment&.id
      idea = comment&.idea
      idea_id = comment&.idea_id
      initiator_id = activity.user_id
      project_id = idea&.project_id

      if comment_id && recipient_id && initiator_id && (recipient_id != initiator_id)
        [self.create(
           recipient_id: recipient_id,
           initiating_user: User.find(initiator_id),
           idea_id: idea_id,
           comment_id: comment_id,
           project_id: project_id
         )]
      else
        []
      end
    end

  end
end

