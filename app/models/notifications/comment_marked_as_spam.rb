module Notifications
  class CommentMarkedAsSpam < MarkedAsSpam

    validates :comment, :post, presence: true

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Comment marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      initiator_id = spam_report&.user_id
      if spam_report.spam_reportable_type == 'Comment' && initiator_id
        attributes = {
          initiating_user_id: initiator_id,
          spam_report: spam_report,
          comment_id: spam_report.spam_reportable.id,
          post_id: spam_report.spam_reportable.post_id,
          post_type: spam_report.spam_reportable.post_type,
          reason_code: activity.payload['reason_code'],
          other_reason: activity.payload['other_reason'],
        }
        if attributes[:post_type] == 'Idea'
          attributes[:project_id] = spam_report.spam_reportable.post.project_id
        end

        self.recipient_ids(initiator_id, attributes[:project_id]).map do |recipient_id|
          self.new(
            recipient_id: recipient_id,
            **attributes
          )
        end
      else
        []
      end
    end

  end
end

