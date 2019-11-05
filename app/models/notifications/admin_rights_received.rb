module Notifications
  class AdminRightsReceived < Notification

    ACTIVITY_TRIGGERS = {'User' => {'admin_rights_given' => true}}
    EVENT_NAME = 'Admin rights received'

    def self.make_notifications_on activity
      recipient_id = activity.item_id
      initiator_id = activity.user_id
      
      if recipient_id && (recipient_id != initiator_id)
        [self.new(
           recipient_id: recipient_id,
           initiating_user_id: initiator_id
         )]
      else
        []
      end
    end

  end
end