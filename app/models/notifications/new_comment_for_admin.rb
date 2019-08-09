module Notifications
  class NewCommentForAdmin < Notification
    
    belongs_to :initiating_user, class_name: 'User'

    validates :initiating_user, presence: true

    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'New comment for admin'


    def self.make_notifications_on activity
      comment = activity.item
      initiator = comment.author
      
      if initiator && !(initiator&.admin? || initiator.project_moderator?(comment.project.id))
        User.admin.or(User.project_moderator(comment.project.id)).map do |recipient|
          self.new(
           recipient_id: recipient.id,
           initiating_user: initiator,
           comment_id: comment.id,
           idea_id: comment.idea_id,
           project_id: comment.project.id
         )
        end
      else
        []
      end
    end

  end
end