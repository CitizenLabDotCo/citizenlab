class LogActivityJob < ApplicationJob
  include SideFxHelper
  queue_as :default

  def perform(item, action, user, acted_at=Time.now, options={})
    activity = if item.kind_of? String 
      # when e.g. the item has been destroyed,
      # the class and id must be retrieved by
      # encoding and decoding to a string
      claz, id = decode_frozen_resource(item)
      Activity.new(item_type: claz.name, item_id: id)
    else
      # item.class.name is needed for polymorphic subclasses like Notification
      # descendants
      Activity.new(item: item, item_type: item.class.name)
    end

    activity.action = action
    activity.user = user
    activity.acted_at = Time.at(acted_at)
    activity.payload = options[:payload] || {}

    activity.save!

    Notification.classes_for(activity).each do |notification_class|
      MakeNotificationsForClassJob.perform_later(notification_class.name, activity)
    end
    EmailCampaigns::TriggerOnActivityJob.perform_later(activity)
    LogToEventbusJob.perform_later(activity) if BUNNY_CON

    # We're nog longer logging notifications to segment, as there are mass
    # notifications that count as segment's monthly active users, which is too
    # expensive
    if Analytics && !item.kind_of?(Notification)
      LogToSegmentJob.perform_later(activity)
    end
  end

end
