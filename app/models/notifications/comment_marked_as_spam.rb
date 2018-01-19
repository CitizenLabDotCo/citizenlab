module Notifications
  class CommentMarkedAsSpam < MarkedAsSpam
    
    # belongs_to :comment
    # belongs_to :idea

    # validates :comment_id, presence: true


    EVENT_NAME = 'Comment marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      initiating_user = User.find(spam_report&.user_id)
      if spam_report.spam_reportable_type == 'Comment'
        self.recipient_ids(initiating_user).map do |recipient_id|
          self.create(
            recipient_id: recipient_id,
            initiating_user: initiating_user,
            spam_report: spam_report,
            comment_id: spam_report.spam_reportable&.id,
            idea_id: spam_report.spam_reportable&.idea_id,
            project_id: spam_report.spam_reportable&.idea&.project_id
          )
        end
      else
        []
      end
    end

  end
end

