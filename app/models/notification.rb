class Notification < ApplicationRecord

  belongs_to :recipient, class_name: 'User'

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
