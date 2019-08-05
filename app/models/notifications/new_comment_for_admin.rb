module Notifications
  class NewCommentForAdmin < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :idea, optional: true
    belongs_to :project, optional: true

    validates :initiating_user, :comment, presence: true

    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'New comment for admin'


    def self.make_notifications_on activity
      comment = activity.item
      initiator = comment.author
      
      if initiator && (comment.post_type == 'Idea') && !(initiator&.admin? || initiator.project_moderator?(comment.post.project.id))
        User.admin.or(User.project_moderator(comment.post.project.id)).map do |recipient|
          self.create(
           recipient_id: recipient.id,
           initiating_user: initiator,
           comment_id: comment.id,
           idea_id: comment.post_id,
           project_id: comment.post.project.id
         )
        end
      else
        []
      end
    end

  end
end