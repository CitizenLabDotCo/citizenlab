class MakeNotificationsJob < ApplicationJob
  queue_as :default

  def perform(activity)
    notification_classes = Notification.classes_for(activity)

    notification_classes.each do |notification_class|
      notifications = notification_class.make_notifications_on(activity)
      notifications.each do |notification|
      	LogActivityJob.perform_later(notification, 'created', activity.user, notification.created_at.to_i)
      end
    end
  end

end
