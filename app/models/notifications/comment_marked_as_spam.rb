module Notifications
  class CommentMarkedAsSpam < MarkedAsSpam
    
    belongs_to :comment
    belongs_to :initiative, optional: true
    belongs_to :idea, optional: true
    belongs_to :project, optional: true

    validates :comment, presence: true

    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}
    EVENT_NAME = 'Comment marked as spam'
    

    def self.make_notifications_on activity
      spam_report = activity.item
      initiating_user = User.find(spam_report&.user_id)
      if spam_report.spam_reportable_type == 'Comment'
        post_attributes = case spam_report.spam_reportable.post_type
        when 'Idea'
          {
            idea: spam_report.spam_reportable.post,
            project_id: spam_report.spam_reportable.post&.project_id
          }
        when 'Initiative'
          {
            initiative_id: spam_report.spam_reportable.post_id
          }
        else
          raise "Unsupported post type #{spam_report.spam_reportable.post_type}"
        end
        self.recipient_ids(initiating_user, project_id).map do |recipient_id|
          self.create(
            recipient_id: recipient_id,
            initiating_user_id: spam_report.user_id,
            spam_report: spam_report,
            comment_id: spam_report.spam_reportable_id,
            **post_attributes
          )
        end
      else
        []
      end
    end

  end
end

