class MakeNotificationsForClassJob < ApplicationJob
  queue_as :default

  def run(notification_class, activity)
    notifications = notification_class.constantize.make_notifications_on(activity)

    notifications.each(&:validate!)

    notifications.each do |notification|
      ErrorReporter.handle(ActiveRecord::RecordInvalid) do
        notification.save!
        LogActivityJob.set(wait: 10.seconds).perform_later(notification, 'created', notification.recipient, notification.created_at.to_i)
      end
    end
  end

end
