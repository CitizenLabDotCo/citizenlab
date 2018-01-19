module Notifications
  class CommentOnYourIdea < Notification
    
    # belongs_to :initiating_user, class_name: 'User'
    # belongs_to :comment
    # belongs_to :idea
    # belongs_to :project, optional: true

    # validates :comment_id, presence: true
    # validates :initiating_user, presence: true
    # validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'Comment on your idea'
    

    def self.make_notifications_on activity
      comment = activity.item

      comment_id = comment&.id
      idea = comment&.idea
      idea_id = comment&.idea_id
      recipient_id = idea&.author_id
      initiator_id = comment&.author_id
      project_id = idea&.project_id

      if comment_id && idea_id && recipient_id && initiator_id && (recipient_id != initiator_id)
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

