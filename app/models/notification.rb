class Notification < ApplicationRecord

  belongs_to :recipient, class_name: 'User'
  belongs_to :initiating_user, class_name: 'User', optional: true
  belongs_to :project, optional: true
  belongs_to :idea, optional: true
  belongs_to :comment, optional: true
  belongs_to :spam_report, optional: true

  scope :unread,  -> {where(read_at: nil)}


  def self.classes_for activity
    self.descendants.select do |notification_class|
      notification_class::ACTIVITY_TRIGGERS.dig(activity.item_type, activity.action)
    end
  end

  def policy_class
    NotificationPolicy
  end
end
