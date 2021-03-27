module Notifications
  class OfficialFeedbackOnYourInitiative < Notification

    validates :initiating_user, :post, :official_feedback, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on your initiative'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      if official_feedback.post_type == 'Initiative'
        recipient_id = official_feedback.post.author_id
        initiator_id = official_feedback&.user_id

        if !InitiativeStatusChange.where(official_feedback: official_feedback).exists? && (recipient_id != initiator_id)
          [self.new(
             recipient_id: recipient_id,
             initiating_user_id: initiator_id,
             post: official_feedback.post,
             official_feedback: official_feedback
           )]
        else
          []
        end
      else
        []
      end
    end

  end
end

