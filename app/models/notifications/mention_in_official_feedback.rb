module Notifications
  class MentionInOfficialFeedback < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :official_feedback
    belongs_to :idea
    belongs_to :project, optional: true

    validates :official_feedback_id, presence: true
    validates :initiating_user, presence: true
    validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'OfficialFeedback' => {'mentioned' => true}}
    EVENT_NAME = 'Mention in official feedback'
    

    def self.make_notifications_on activity
      official_feedback = activity.item
      recipient_id = activity.payload["mentioned_user"]

      official_feedback_id = official_feedback&.id
      idea = official_feedback&.post
      idea_id = official_feedback&.post_id
      initiator_id = official_feedback&.user_id
      participant_ids = [idea.author_id]
      participant_ids += idea.votes.pluck(:user_id)
      participant_ids += idea.comments.pluck(:author_id)
      participant_ids.uniq!

      if (official_feedback&.post_type == 'Idea') && official_feedback_id && idea_id && recipient_id && initiator_id && (recipient_id != initiator_id) && !participant_ids.include?(recipient_id)
        project_id = idea&.project_id

        [self.new(
           recipient_id: recipient_id,
           initiating_user: User.find(initiator_id),
           idea_id: idea_id,
           official_feedback_id: official_feedback_id,
           project_id: project_id
         )]
      else
        []
      end
    end

  end
end

