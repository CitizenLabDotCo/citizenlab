# frozen_string_literal: true

module Notifications
  class MarkedAsSpam < Notification
    validates :initiating_user, presence: true
    validates :spam_report, presence: true

    ACTIVITY_TRIGGERS = { 'SpamReport' => { 'created' => true } }.freeze

    def self.recipient_ids(initiating_user_id = nil, project_id = nil)
      admin_ids = User.admin.ids
      admin_ids.delete(initiating_user_id) if initiating_user_id
      admin_ids
    end

    def self.make_notifications_on(_activity)
      []
    end
  end
end

Notifications::MarkedAsSpam.prepend_if_ee('ProjectManagement::Patches::Notifications::MarkedAsSpam')
