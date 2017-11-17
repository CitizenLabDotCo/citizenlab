module Notifications
  class CommentOnYourComment < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :idea
    belongs_to :project, optional: true

    validates :comment_id, presence: true
    validates :initiating_user, presence: true
    validates :idea_id, presence: true

    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'Comment on your comment'


    def self.make_notifications_on activity
      child_comment = activity.item
      parent_comment = child_comment&.parent
      return [] unless parent_comment

      child_comment_id = child_comment&.id
      idea = parent_comment&.idea
      idea_id = parent_comment&.idea_id
      recipient_id = parent_comment&.author_id
      initiator_id = child_comment&.author_id
      project_id = idea&.project_id

      if child_comment_id && idea_id && recipient_id && initiator_id && (recipient_id != initiator_id)
        [self.create(
           recipient_id: recipient_id,
           initiating_user: User.find(initiator_id),
           idea_id: idea_id,
           comment_id: child_comment_id,
           project_id: project_id
         )]
      else
        []
      end
    end

  end
end