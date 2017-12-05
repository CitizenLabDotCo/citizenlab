class MakeNotificationsJob < ApplicationJob
  queue_as :default

  def perform(activity)
    notification_classes = Notification.classes_for(activity)

    notification_classes.each do |notification_class|
      notifications = notification_class.make_notifications_on(activity)
      notifications.each do |notification|
      	LogActivityJob.set(wait: 10.seconds).perform_later(notification, 'created', notification.recipient, notification.created_at.to_i)
      end
    end
  end

end
