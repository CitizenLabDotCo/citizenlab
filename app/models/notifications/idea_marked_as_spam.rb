module Notifications
  class IdeaMarkedAsSpam < MarkedAsSpam
    
    belongs_to :idea

    validates :idea_id, presence: true


    EVENT_NAME = 'Idea marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      initiating_user = User.find(spam_report&.user_id)
      project_id = spam_report.spam_reportable&.project_id
      if spam_report.spam_reportable_type == 'Idea'
        self.recipient_ids(initiating_user, project_id).map do |recipient_id|
          self.create(
            recipient_id: recipient_id,
            initiating_user: initiating_user,
            spam_report: spam_report,
            idea_id: spam_report.spam_reportable&.id,
            project_id: project_id
          )
        end
      else
        []
      end
    end

  end
end

