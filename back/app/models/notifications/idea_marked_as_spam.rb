module Notifications
  class IdeaMarkedAsSpam < MarkedAsSpam

    validates :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Idea marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      if spam_report.spam_reportable_type == 'Idea'
        initiator_id = spam_report.user_id
        project_id = spam_report.spam_reportable.project_id
        self.recipient_ids(initiator_id, project_id).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user_id: initiator_id,
            spam_report: spam_report,
            post: spam_report.spam_reportable,
            project_id: project_id
          )
        end
      else
        []
      end
    end

  end
end

