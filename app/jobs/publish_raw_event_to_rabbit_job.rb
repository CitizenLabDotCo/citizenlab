class PublishRawEventToRabbitJob < ApplicationJob
  queue_as :default

  def perform(event, routing_key)
    service = LogToSegmentService.new

    begin
      tenant = Tenant.current
      service.add_tenant_properties event, tenant
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end

    channel = BUNNY_CON.create_channel
    exchange = channel.topic "cl2back"

    exchange.publish(
      event.to_json,
      app_id: 'cl2-back',
      content_type: 'application/json',
      routing_key: routing_key
    )
    channel.close
  end

end
