module Notifications
  class NewCommentForAdmin < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :post, polymorphic: true
    belongs_to :project, optional: true

    validates :initiating_user, :comment, :post, presence: true

    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'New comment for admin'


    def self.make_notifications_on activity
      comment = activity.item
      initiator = comment.author
      
      if initiator && !initiator&.admin? 
        attributes = {
          initiating_user: initiator,
          comment: comment,
          post_id: comment.post_id,
          post_type: comment.post_type,
        }
        recipients = User.admin
        if attributes[:post_type] == 'Idea'
          return nil if initiator.project_moderator?(comment.post.project.id)
          attributes[:project_id] = comment.post.project_id
          recipients = recipients.or(User.project_moderator(comment.post.project.id))
        end
        recipients.ids.map do |recipient_id|
          self.new(
            **attributes,
            recipient_id: recipient_id
          )
        end
      else
        []
      end
    end

  end
end