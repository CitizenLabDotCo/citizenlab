module Notifications
  class StatusChangeOfYourIdea < Notification
    
    belongs_to :idea
    belongs_to :project, optional: true
    belongs_to :idea_status, optional: true

    validates :idea_id, presence: true


    ACTIVITY_TRIGGERS = {'Idea' => {'changed_status' => true}}
    EVENT_NAME = 'Status change of your idea'
    

    def self.make_notifications_on activity
      idea = activity.item

      idea_id = idea&.id
      recipient_id = idea&.author_id
      project_id = idea&.project_id
      idea_status_id = idea&.idea_status_id

      if idea_id && recipient_id
        [self.create!(
           recipient_id: recipient_id,
           idea_id: idea_id,
           project_id: project_id,
           idea_status_id: idea_status_id
         )]
      else
        []
      end
    end

  end
end

