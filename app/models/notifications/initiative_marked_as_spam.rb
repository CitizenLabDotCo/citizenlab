module Notifications
  class InitiativeMarkedAsSpam < MarkedAsSpam
    
    belongs_to :initiative
    belongs_to :project, optional: true

    validates :initiative, presence: true

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Initiative marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      if spam_report.spam_reportable_type == 'Initiative'
        self.recipient_ids(initiating_user, project_id).map do |recipient_id|
          self.create(
            recipient_id: recipient_id,
            initiating_user_id: spam_report.user_id,
            spam_report: spam_report,
            initiative_id: spam_report.spam_reportable_id,
          )
        end
      else
        []
      end
    end

  end
end

