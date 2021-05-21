module FlagInappropriateContent
  module Notifications
    class InappropriateContentFlagged < Notification

      validates :inappropriate_content_flag, presence: true

      ACTIVITY_TRIGGERS = {'FlagInappropriateContent::InappropriateContentFlag' => {'created' => true}}
      EVENT_NAME = 'Inappropriate content flagged'
      

      def self.recipient_ids
        User.admin.ids
      end

      def self.make_notifications_on activity
        flag = activity.item
        self.recipient_ids.map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user: activity.user,
            inappropriate_content_flag: flag
          )
        end
      end

    end
  end
end

