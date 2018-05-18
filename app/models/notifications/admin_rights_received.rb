module Notifications
  class AdminRightsReceived < Notification
    
    belongs_to :initiating_user, class_name: 'User'

    validates :initiating_user, presence: true

    ACTIVITY_TRIGGERS = {'User' => {'admin_rights_given' => true}}
    EVENT_NAME = 'Admin rights received'


    def self.make_notifications_on activity
      admin = activity.item
      recipient_id = admin.id
      initiator_id = activity.user_id
      
      if recipient_id && initiator_id && (recipient_id != initiator_id)
        [self.create(
           recipient_id: admin.id,
           initiating_user: User.find(initiator_id)
         )]
      else
        []
      end
    end

  end
end