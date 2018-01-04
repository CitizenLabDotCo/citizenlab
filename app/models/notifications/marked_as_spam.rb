module Notifications
  class MarkedAsSpam < Notification
    
    belongs_to :initiating_user, class_name: 'User'
    belongs_to :spam_report
    belongs_to :project, optional: true

    validates :initiating_user, presence: true
    validates :spam_report, presence: true


    ACTIVITY_TRIGGERS = {'SpamReport' => {'created' => true}}

    def self.recipient_ids initiating_user=nil
      ids = User.admin.map(&:id)
      if initiating_user
        ids = ids.select{|id| id != initiating_user.id}
      end
      ids
    end

    def self.make_notifications_on activity
      []
    end

  end
end

