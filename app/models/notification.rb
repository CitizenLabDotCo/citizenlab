class Notification < ApplicationRecord

  belongs_to :recipient, class_name: 'User'

  def self.classes_for activity
    self.descendants.select do |notification_class|
      notification_class::ACTIVITY_TRIGGERS.dig(activity.item_type, activity.action)
    end
  end
end
