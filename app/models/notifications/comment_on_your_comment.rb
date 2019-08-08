module Notifications
  class CommentOnYourComment < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :comment
    belongs_to :idea, optional: true
    belongs_to :initiative, optional: true
    belongs_to :project, optional: true

    validates :comment_id, presence: true
    validates :initiating_user, presence: true

    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'Comment on your comment'


    def self.make_notifications_on activity
      comment = activity.item
      recipient_id = comment.parent&.author_id
      initiator_id = comment&.author_id

      if comment.parent_id && recipient_id && initiator_id && (recipient_id != initiator_id)
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