
class Notification < ApplicationRecord

  belongs_to :recipient, class_name: 'User'
  belongs_to :initiating_user, class_name: 'User', optional: true
  belongs_to :project, optional: true
  belongs_to :idea, optional: true
  belongs_to :comment, optional: true
  belongs_to :spam_report, optional: true
  belongs_to :invite, optional: true

  scope :unread,  -> {where(read_at: nil)}


  def self.classes_for activity
    Dir[File.join(__dir__, 'notifications', '*.rb')].each { |file| require_dependency file }
    self.descendants.select do |notification_class|
      notification_class::ACTIVITY_TRIGGERS.dig(activity.item_type, activity.action)
    end
  end

  def event_bus_item_name
    "Notification for #{self.class::EVENT_NAME}"
  end

  # We implement a custom item_content, since we don't want the whole content
  # to be nested under a 'notification/some_notification_type' key
  def event_bus_item_content
    serializer = "WebApi::V1::External::#{self.class.name}Serializer".constantize
    ActiveModelSerializers::SerializableResource.new(self, {
      serializer: serializer,
      adapter: :json
    }).serializable_hash.values.first
  end

  def policy_class
    NotificationPolicy
  end
end
