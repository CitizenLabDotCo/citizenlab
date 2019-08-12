module Notifications
  class IdeaMarkedAsSpam < MarkedAsSpam
    
    belongs_to :idea
    belongs_to :project, optional: true

    validates :idea, presence: true

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Idea marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      if spam_report.spam_reportable_type == 'Idea'
        project_id = spam_report.spam_reportable&.project_id
        initiating_user = spam_report.user
        self.recipient_ids(initiating_user, project_id).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user: initiating_user,
            spam_report: spam_report,
            idea_id: spam_report.spam_reportable_id,
            project_id: project_id
          )
        end
      else
        []
      end
    end

  end
end

