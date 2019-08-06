module Notifications
  class MentionInOfficialFeedback < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :official_feedback
    belongs_to :initiative, optional: true
    belongs_to :idea, optional: true
    belongs_to :project, optional: true

    validates :official_feedback, presence: true
    validates :initiating_user, presence: true


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'mentioned' => true}}
    EVENT_NAME = 'Mention in official feedback'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      recipient_id = activity.payload["mentioned_user"]
      initiator_id = official_feedback&.user_id
      participant_ids = [official_feedback.post.author_id]
      participant_ids += official_feedback.post.votes.pluck(:user_id)
      participant_ids += official_feedback.post.comments.pluck(:author_id)
      participant_ids.uniq!

      if recipient_id && initiator_id && (recipient_id != initiator_id) && !participant_ids.include?(recipient_id)
        post_attributes = case comment.post_type
        when 'Idea'
          {
            idea: official_feedback.post,
            project_id: official_feedback.post.project_id
          }
        when 'Initiative'
          {
            initiative_id: official_feedback.post_id
          }
        else
          raise "Unsupported post type #{official_feedback.post_type}"
        end
        [self.create(
           recipient_id: recipient_id,
           initiating_user_id: initiator_id,
           official_feedback: official_feedback_id,
           **post_attributes
         )]
      else
        []
      end
    end

  end
end

