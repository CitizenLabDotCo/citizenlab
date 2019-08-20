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
      initiator_id = comment.author_id
      
      if initiator_id && !(initiator&.admin? || initiator.project_moderator?(comment.post.project.id))
        attributes = [
          initiating_user_id: initiator_id,
          comment: comment,
          post_id: comment.post_id,
          post_type: comment.post_type,
        ]
        recipients = User.admin
        if attributes[:post_type] == 'Idea'
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