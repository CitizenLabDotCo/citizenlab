module Notifications
  class StatusChangeOfYourIdea < Notification
    
    belongs_to :idea_status
    belongs_to :post
    belongs_to :project
    belongs_to :initiating_user, class_name: 'User', optional: true

    validates :idea_status, :post, :project, presence: true


    ACTIVITY_TRIGGERS = {'Idea' => {'changed_status' => true}}
    EVENT_NAME = 'Status change of your idea'
    

    def self.make_notifications_on activity
      idea = activity.item
      recipient_id = idea&.author_id

      if idea && recipient_id
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: activity.user_id,
           post: idea,
           project_id: idea.project_id,
           idea_status_id: idea.idea_status_id
         )]
      else
        []
      end
    end

  end
end

