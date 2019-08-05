class Notification < ApplicationRecord

  belongs_to :recipient, class_name: 'User'

  scope :unread,  -> {where(read_at: nil)}


  def self.classes_for activity
    Dir[File.join(__dir__, 'notifications', '*.rb')].each { |file| require_dependency file }
    self.descendants.select do |notification_class|
      notification_class::ACTIVITY_TRIGGERS.dig(activity.item_type, activity.action)
    end
  end

  def event_bus_item_name
    "Notification for #{event_name}"
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


  private

  def event_name
    self.class::EVENT_NAME
  end
end
