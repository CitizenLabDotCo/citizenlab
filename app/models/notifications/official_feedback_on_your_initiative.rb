module Notifications
  class OfficialFeedbackOnYourInitiative < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :official_feedback
    belongs_to :initiative

    validates :official_feedback, presence: true
    validates :initiating_user, presence: true
    validates :initiative, presence: true


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on your initiative'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      if official_feedback.post_type == 'Initiative'
        recipient_id = official_feedback.post.author_id
        initiator_id = official_feedback&.user_id
        if official_feedback && recipient_id && initiator_id && (recipient_id != initiator_id)
          [self.new(
             recipient_id: recipient_id,
             initiating_user_id: initiator_id,
             initiative: official_feedback.post,
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

