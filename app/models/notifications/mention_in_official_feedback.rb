module Notifications
  class MentionInOfficialFeedback < Notification

    validates :official_feedback, :post, :initiating_user, presence: true


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'mentioned' => true}}
    EVENT_NAME = 'Mention in official feedback'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      recipient_id = activity.payload['mentioned_user']
      initiator_id = official_feedback&.user_id
      participant_ids = [official_feedback.post.author_id]
      participant_ids += official_feedback.post.votes.pluck(:user_id)
      participant_ids += official_feedback.post.comments.pluck(:author_id)
      participant_ids.uniq!

      if recipient_id && initiator_id && (recipient_id != initiator_id) && !participant_ids.include?(recipient_id)
        attributes = {
          recipient_id: recipient_id,
          initiating_user_id: initiator_id,
          official_feedback: official_feedback,
          post_id: official_feedback.post_id,
          post_type: official_feedback.post_type
        }
        if attributes[:post_type] == 'Idea'
          attributes[:project_id] = official_feedback.post.project_id
        end 
        [self.new(attributes)]
      else
        []
      end
    end

  end
end

