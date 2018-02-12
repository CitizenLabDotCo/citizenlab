class LogToEventbusJob < ApplicationJob
  queue_as :default

  def perform(activity, user_id=nil)

    trackingMessage = {
      event: "#{activity.item_type} #{activity.action}",
      timestamp: activity.acted_at,
      item_type: activity.item_type,
      item_id: activity.item_id,
      action: activity.action,
      payload: activity.payload,
      user_id: user_id || activity.user_id
    }

    if activity.item
      begin
        serializer = "WebApi::V1::External::#{activity.item_type}Serializer".constantize
        serialization = ActiveModelSerializers::SerializableResource.new(activity.item, {
          serializer: serializer,
          adapter: :json
        })
        item_content = serialization.serializable_hash
        if activity.item.kind_of? Notification
          trackingMessage[:event] = "Notification for #{activity.item.class::EVENT_NAME} created"
          item_content = item_content.flatten.second
        end
        trackingMessage[:item_content] = item_content
      rescue NameError => e
        # There's no serializer, so we don't add anything
      end
    end

    begin
      tenant = Tenant.current
      trackingMessage[:tenantId] = tenant.id
      trackingMessage[:tenantName] = tenant.name
      trackingMessage[:tenantHost] = tenant.host
      trackingMessage[:tenantOrganizationType] = Tenant.settings('core', 'organization_type')
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end

    channel = BUNNY_CON.create_channel
    exchange = channel.topic("cl2back")

    exchange.publish(
      trackingMessage.to_json,
      app_id: 'cl2-back',
      content_type: 'application/json',
      routing_key: "#{activity.item_type.underscore}.#{activity.action.underscore}"
    )
    channel.close
  end

end
