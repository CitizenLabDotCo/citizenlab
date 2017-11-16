class LogActivityJob < ApplicationJob
  include SideFxHelper
  queue_as :default

  def perform(item, action, user, acted_at=Time.now, options={})
    activity = if item.kind_of? String
      claz, id = decode_frozen_resource(item)
      Activity.new(item_type: claz.name, item_id: id)
    elsif item.kind_of? Notification
      Activity.new(item: item, item_type: item.type) # .split('::').last)
    else
      Activity.new(item: item)
    end

    activity.action = action
    activity.user = user
    activity.acted_at = Time.at(acted_at)
    activity.payload = options[:payload] || {}

    activity.save!

    MakeNotificationsJob.perform_later(activity)
    LogToSegmentJob.perform_later(activity) if Analytics
  end

end
