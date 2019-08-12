module Notifications
  class NewInitiativeForAdmin < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :initiative

    validates :initiating_user, :initiative, presence: true

    ACTIVITY_TRIGGERS = {'Initiative' => {'published' => true}}
    EVENT_NAME = 'New initiative for admin'


    def self.make_notifications_on activity
      initiative = activity.item
      initiator = initiative.author
      
      if initiator && !initiator.admin?
        User.admin.select do |recipient|
          recipient&.id != initiative&.assignee_id
        end.map do |recipient|
          self.new(
           recipient_id: recipient.id,
           initiating_user: initiator,
           initiative_id: initiative.id,
         )
        end
      else
        []
      end
    end

  end
end