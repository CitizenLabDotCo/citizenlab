module Notifications
  class OfficialFeedbackOnYourIdea < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :official_feedback
    belongs_to :post
    belongs_to :project

    validates :initiating_user, :official_feedback, :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'created' => true}}
    EVENT_NAME = 'Official feedback on your idea'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      if official_feedback.post_type == 'Idea'
        recipient_id = official_feedback.post.author_id
        initiator_id = official_feedback&.user_id
        if official_feedback && recipient_id && initiator_id && (recipient_id != initiator_id)
          [self.new(
             recipient_id: recipient_id,
             initiating_user_id: initiator_id,
             post: official_feedback.post,
             official_feedback: official_feedback,
             project_id: official_feedback.post.project_id
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

