module Notifications
  class InitiativeAssignedToYou < Notification
    
    belongs_to :initiating_user, class_name: 'User', optional: true
    belongs_to :initiative

    validates :initiative, presence: true

    ACTIVITY_TRIGGERS = {'Initiative' => {'changed_assignee' => true}}
    EVENT_NAME = 'Initiative assigned to you'


    def self.make_notifications_on activity
      initiative = activity.item
      recipient_id = initiative.assignee_id
      initiator_id = activity.user_id

      # We only notify manual assignments, meaning there needs to be an
      # initiator
      if recipient_id && initiator_id && recipient_id != initiator_id
        [
          self.new(
           recipient_id: recipient_id,
           initiative_id: initiative.id,
           initiating_user_id: initiator_id
         )
        ]
      else
        []
      end
    end

  end
end