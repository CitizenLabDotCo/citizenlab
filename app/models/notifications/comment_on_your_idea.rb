module Notifications
  class CommentOnYourIdea < Notification

    validates :comment, :initiating_user, :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }


    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'Comment on your idea'
    

    def self.make_notifications_on activity
      comment = activity.item
      idea = comment&.post
      recipient_id = idea&.author_id
      initiator_id = comment&.author_id

      if recipient_id && initiator_id && (comment.post_type == 'Idea') && (recipient_id != initiator_id)
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: initiator_id,
           post: idea,
           comment: comment,
           project_id: idea&.project_id
         )]
      else
        []
      end
    end

  end
end

