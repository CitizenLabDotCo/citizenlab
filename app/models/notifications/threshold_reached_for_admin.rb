module Notifications
  class ThresholdReachedForAdmin < Notification

    validates :post, presence: true

    ACTIVITY_TRIGGERS = {'Initiative' => {'reached_threshold' => true}}
    EVENT_NAME = 'Threshold reached for admin'


    def self.make_notifications_on activity
      initiative = activity.item
      initiator_id = activity.user_id
      
      User.admin.ids.select do |recipient_id|
        recipient_id != initiator_id
      end.map do |recipient_id|
        self.new(
         recipient_id: recipient_id,
         initiating_user_id: initiator_id,
         post: initiative,
         post_status: initiative.initiative_status
       )
      end
    end

  end
end