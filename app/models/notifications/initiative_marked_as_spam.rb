module Notifications
  class InitiativeMarkedAsSpam < MarkedAsSpam
    
    belongs_to :post

    validates :post, presence: true
    validates :post_type, inclusion: { in: ['Initiative'] }

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Initiative marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      if spam_report.spam_reportable_type == 'Initiative'
        initiating_user = spam_report.user
        self.recipient_ids(initiating_user).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user: initiating_user,
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

