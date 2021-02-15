class PublishGenericEventToRabbitJob < ApplicationJob
  queue_as :default

  def run(event, routing_key, bunny=BUNNY_CON)
    return unless bunny
    add_tenant_properties(event)
    publish_to_rabbitmq(bunny, event, routing_key)
  end

  private

  def add_tenant_properties(event)
    tenant_properties = TrackingService.new.tenant_properties(Tenant.current)
    event.merge!(tenant_properties)
  rescue ActiveRecord::RecordNotFound
    # Tenant can't be found, so we don't add anything
  end

  # @param [Bunny] bunny RabbitMQ client
  # @param [#to_json] event
  # @param [String] routing_key
  def publish_to_rabbitmq(bunny, event, routing_key)
    bunny.create_channel.tap do |channel|
      exchange = channel.topic('cl2back')
      exchange.publish(
        event.to_json,
        app_id: 'cl2-back',
        content_type: 'application/json',
        routing_key: routing_key
      )
    end.close
  end

end
