module Notifications
  class IdeaAssignedToYou < Notification
    
    belongs_to :initiating_user, class_name: 'User', optional: true

    ACTIVITY_TRIGGERS = {'Idea' => {'changed_assignee' => true}}
    EVENT_NAME = 'Idea assigned to you'


    def self.make_notifications_on activity
      idea = activity.item
      recipient = idea.assignee

      if recipient
        [
          self.create(
           recipient_id: recipient.id,
           idea_id: idea.id,
           project_id: idea.project_id
         )
        ]
      else
        []
      end
    end

  end
end