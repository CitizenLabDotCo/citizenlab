module Notifications
  class MentionInComment < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :initiative, optional: true
    belongs_to :idea, optional: true
    belongs_to :project, optional: true

    validates :comment, presence: true
    validates :initiating_user, presence: true


    ACTIVITY_TRIGGERS = {'Comment' => {'mentioned' => true}}
    EVENT_NAME = 'Mention in a comment'
    

    def self.make_notifications_on activity
      comment = activity.item
      recipient_id = activity.payload["mentioned_user"]
      initiator_id = comment&.author_id

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
           comment: comment,
           **post_attributes
         )]
      else
        []
      end
    end

  end
end

