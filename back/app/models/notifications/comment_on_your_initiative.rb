module Notifications
  class CommentOnYourInitiative < Notification

    validates :comment, :initiating_user, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }


    ACTIVITY_TRIGGERS = {'Comment' => {'created' => true}}
    EVENT_NAME = 'Comment on your initiative'
    

    def self.make_notifications_on activity
      comment = activity.item
      initiative = comment&.post
      recipient_id = initiative&.author_id
      initiator_id = comment&.author_id

      if recipient_id && initiator_id && (comment.post_type == 'Initiative') && (recipient_id != initiator_id)
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: initiator_id,
           post: initiative,
           comment: comment
         )]
      else
        []
      end
    end

  end
end

