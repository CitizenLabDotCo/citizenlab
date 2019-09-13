module Notifications
  class InitiativeAssignedToYou < Notification

    validates :initiating_user, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }

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
           post: initiative,
           initiating_user_id: initiator_id
         )
        ]
      else
        []
      end
    end

  end
end