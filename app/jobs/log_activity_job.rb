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

    MakeNotificationsJob.perform_later(activity)
    LogToEventbusJob.perform_later(activity) if BUNNY_CON
    LogToSegmentJob.perform_later(activity) if Analytics
  end

end
