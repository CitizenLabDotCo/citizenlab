class LogToEventbusJob < ApplicationJob
  queue_as :default

  def perform(activity)
    event = LogToSegmentService.new.tracking_message_for_activity activity
    return if !event

    channel = BUNNY_CON.create_channel
    exchange = channel.topic("cl2back")

    exchange.publish(
      event.to_json,
      app_id: 'cl2-back',
      content_type: 'application/json',
      routing_key: "#{activity.item_type.underscore}.#{activity.action.underscore}"
    )
    channel.close
  end

end
