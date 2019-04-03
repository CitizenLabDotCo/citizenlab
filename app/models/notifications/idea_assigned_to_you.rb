module Notifications
  class IdeaAssignedToYou < Notification
    
    belongs_to :initiating_user, class_name: 'User', optional: true

    ACTIVITY_TRIGGERS = {'Idea' => {'assigned' => true}}
    EVENT_NAME = 'Idea assigned to you'


    def self.make_notifications_on activity
      idea = activity.item
      recipient = idea.assignee
      initiator_id = activity.user_id

      if recipient
        [
          self.create(
           recipient_id: recipient.id,
           idea_id: idea.id,
           project_id: idea.project_id,
           initiating_user_id: initiator_id
         )
        ]
      else
        []
      end
    end

  end
end