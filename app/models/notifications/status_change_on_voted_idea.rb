module Notifications
  class StatusChangeOnVotedIdea < Notification
    
    belongs_to :idea
    belongs_to :project, optional: true
    belongs_to :idea_status, optional: true

    validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'Idea' => {'changed_status' => true}}
    EVENT_NAME = 'Status change on voted idea'
    

    def self.make_notifications_on activity
      idea = activity.item

      idea_id = idea&.id
      recipient_id = idea&.author_id
      initiator_id = activity&.user_id
      project_id = idea&.project_id
      idea_status_id = idea&.idea_status_id

      if idea_id && recipient_id && recipient_id != initiator_id
        comment_author_ids = idea.comments.pluck(:author_id)
        idea.votes.pluck(:user_id).map do |recipient_id|
          if (recipient_id != initiator_id) && !(comment_author_ids + [idea.author_id]).include?(recipient_id)
            self.create!(
              recipient_id: recipient_id,
              initiating_user: User.find_by(id: initiator_id),
              idea_id: idea_id,
              project_id: project_id,
              idea_status_id: idea_status_id
            )
          end
        end
      else
        []
      end.compact
    end

  end
end

