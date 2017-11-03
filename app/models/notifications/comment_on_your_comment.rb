module Notifications
  class CommentOnYourComment < Notification
    
    belongs_to :user
    belongs_to :comment
    belongs_to :idea
    belongs_to :project, optional: true

    validates :comment_id, presence: true
    validates :user_id, presence: true
    validates :idea_id, presence: true

    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}

    def self.make_notifications_on activity
      child_comment = activity.item
      parent_comment = child_comment&.parent
      return [] unless parent_comment

      child_comment_id = child_comment&.id
      idea = parent_comment&.idea
      idea_id = parent_comment&.idea_id
      parent_comment_author_id = parent_comment&.author_id
      child_comment_author_id = child_comment&.author_id
      project_id = idea&.project_id

      if child_comment_id && idea_id && parent_comment_author_id && child_comment_author_id
        [self.create(
           recipient_id: parent_comment_author_id,
           user_id: child_comment_author_id,
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