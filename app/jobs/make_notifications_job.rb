class MakeNotificationsJob < ApplicationJob
  queue_as :default

  def perform(activity)
    
    notification_classes = Notification.classes_for(activity)

    notification_classes.each do |notification_class|
      notification_class.make_notifications_on(activity)
    end

  end

end
