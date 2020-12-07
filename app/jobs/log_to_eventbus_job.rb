class LogToEventbusJob < ApplicationJob
  queue_as :default

  def perform activity
    service = TrackingService.new

    event = {
      event: service.activity_event_name(activity),
      timestamp: activity.acted_at,
      **service.activity_properties(activity),
      **service.environment_properties(),
      item_content: service.activity_item_content(activity)
    }
    event[:user_id] = activity.user_id if activity.user_id
    begin
      tenant = Tenant.current
      event = event.merge(service.tenant_properties(tenant))
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end

    publish_to_rabbit event, activity
  end


  private

  def publish_to_rabbit event, activity
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
