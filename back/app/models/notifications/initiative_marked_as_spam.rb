module Notifications
  class InitiativeMarkedAsSpam < MarkedAsSpam

    validates :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Initiative marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      if spam_report.spam_reportable_type == 'Initiative'
        initiator_id = spam_report.user_id
        self.recipient_ids(initiator_id).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user_id: initiator_id,
            spam_report: spam_report,
            post: spam_report.spam_reportable
          )
        end
      else
        []
      end
    end

  end
end

