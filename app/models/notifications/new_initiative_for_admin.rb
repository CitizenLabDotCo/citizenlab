module Notifications
  class NewInitiativeForAdmin < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :post, polymorphic: true

    validates :initiating_user, :post, presence: true

    ACTIVITY_TRIGGERS = {'Initiative' => {'published' => true}}
    EVENT_NAME = 'New initiative for admin'


    def self.make_notifications_on activity
      initiative = activity.item
      initiator = initiative.author
      
      if initiator && !initiator.admin?
        User.admin.ids.select do |recipient_id|
          recipient_id != initiative&.assignee_id
        end.map do |recipient_id|
          self.new(
           recipient_id: recipient_id,
           initiating_user: initiator,
           post: initiative,
         )
        end
      else
        []
      end
    end

  end
end