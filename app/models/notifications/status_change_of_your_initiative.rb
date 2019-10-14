module Notifications
  class StatusChangeOfYourInitiative < Notification

    validates :post_status, :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }


    ACTIVITY_TRIGGERS = {'Initiative' => {'changed_status' => true}}
    EVENT_NAME = 'Status change of your initiative'
    

    def self.make_notifications_on activity
      initiative = activity.item
      recipient_id = initiative&.author_id

      if initiative && recipient_id
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: activity.user_id,
           post: initiative,
           post_status: initiative.initiative_status
         )]
      else
        []
      end
    end

  end
end

