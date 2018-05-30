class LogToEventbusJob < ApplicationJob
  queue_as :default

  def perform activity
    tenant = Tenant.current
    return if !tenant
    service = LogToSegmentService.new

    event = {
      event: service.activity_event_name(activity),
      timestamp: activity.acted_at
    }
    event[:user_id] = activity.user_id if activity.user_id
    service.add_activity_properties event, activity
    service.add_tenant_properties event, tenant
    service.add_activity_item_content event, event, activity

    publish_to_rabbit event
  end


  private

  def publish_to_rabbit event
    channel = BUNNY_CON.create_channel
    exchange = channel.topic "cl2back"

    exchange.publish(
      event.to_json,
      app_id: 'cl2-back',
      content_type: 'application/json',
      routing_key: "#{activity.item_type.underscore}.#{activity.action.underscore}"
    )
    channel.close
  end

end
