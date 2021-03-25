module Notifications
  class MarkedAsSpam < Notification

    validates :initiating_user, presence: true
    validates :spam_report, presence: true


    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}

    def self.recipient_ids initiating_user_id=nil, project_id=nil
      admin_ids = User.admin.ids
      moderator_ids = []
      if project_id
        moderator_ids = User
          .project_moderator(project_id)
          .ids
      end
      ids = (admin_ids + moderator_ids).uniq
      if initiating_user_id
        ids = ids.select{|id| id != initiating_user_id}
      end
      ids
    end

    def self.make_notifications_on activity
      []
    end

  end
end

