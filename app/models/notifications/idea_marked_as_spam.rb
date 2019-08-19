module Notifications
  class IdeaMarkedAsSpam < MarkedAsSpam
    
    belongs_to :post
    belongs_to :project

    validates :post, :project, presence: true
    validates :post_type, inclusion: { in: ['Idea'] }

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Idea marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      if spam_report.spam_reportable_type == 'Idea'
        initiating_user = spam_report.user
        project_id = spam_report.spam_reportable_id
        self.recipient_ids(initiating_user, initiating_user).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            initiating_user: initiating_user,
            spam_report: spam_report,
            post: spam_report.spam_reportable,
            project_id: initiating_user
          )
        end
      else
        []
      end
    end

  end
end

