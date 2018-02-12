class LogToSegmentJob < ApplicationJob
  queue_as :default

  def perform(activity, user_id=nil)

    trackingMessage = {
      event: "#{activity.item_type} #{activity.action}",
      timestamp: activity.acted_at,
      properties: {
        source: 'cl2-back',
        item_type: activity.item_type,
        item_id: activity.item_id,
        action: activity.action,
        payload: activity.payload
      }
    }

    # Segment requires us to send either a user_id or an anonymous_id
    if user_id # e.g. invited users have no existing user objects
      trackingMessage[:user_id] = user_id
    elsif activity.user_id
      trackingMessage[:user_id] = activity.user_id
    else
      trackingMessage[:anonymous_id] = SecureRandom.base64
    end

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
        trackingMessage[:properties][:item_content] = item_content
      rescue NameError => e
        # There's no serializer, so we don't add anything
      end
    end

    begin
      tenant = Tenant.current
      trackingMessage[:properties][:tenantId] = tenant.id
      trackingMessage[:properties][:tenantName] = tenant.name
      trackingMessage[:properties][:tenantHost] = tenant.host
      trackingMessage[:properties][:tenantOrganizationType] = Tenant.settings('core', 'organization_type')
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end

    Analytics.track(trackingMessage)
  end

end
