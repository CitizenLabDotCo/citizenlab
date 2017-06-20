module Notifications
  class CommentOnYourIdea < Notification
    
    belongs_to :user
    belongs_to :comment
    belongs_to :idea

    validates :comment_id, presence: true
    validates :user_id, presence: true
    validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}

    def self.make_notifications_on activity
      comment = activity.item

      comment_id = comment&.id
      idea = comment&.idea
      idea_id = comment&.idea_id
      idea_author_id = idea&.author_id
      comment_author_id = comment&.author_id
      project_id = idea&.project_id

      if comment_id && idea_id && idea_author_id && comment_author_id
        self.create(
          recipient_id: idea_author_id,
          user_id: comment_author_id,
          idea_id: idea_id,
          comment_id: comment_id,
          project_id: project_id
        )
      end
    end

  end
end

