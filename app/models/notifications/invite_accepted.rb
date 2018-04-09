module Notifications
  class InviteAccepted < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :invite

    validates :initiating_user, presence: true
    validates :invite_id, presence: true


    ACTIVITY_TRIGGERS = {'Invite' => {'accepted' => true}}
    EVENT_NAME = 'Invite accepted'
    

    def self.make_notifications_on activity
      invite = activity.item

      invite_id = invite&.id
      recipient_id = invite&.inviter_id
      initiator_id = invite&.invitee_id

      if invite_id && recipient_id && initiator_id
        [self.create(
           recipient_id: recipient_id,
           initiating_user: User.find(initiator_id),
           invite_id: invite_id
         )]
      else
        []
      end
    end

  end
end

