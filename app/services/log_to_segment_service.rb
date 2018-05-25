class LogToSegmentService

  def tracking_message event_name, options={}
    user_id = options[:user_id] 
    timestamp = options[:timestamp] || Time.now
    tenant = options[:tenant] || Tenant.current
    payload = options[:payload] || {}
    msg = {
      event: event_name,
      timestamp: timestamp,
      properties: {
        source: 'cl2-back',
        payload: payload
      },
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantHost: tenant.host,
      tenantOrganizationType: tenant.settings.dig('core', 'organization_type'),
      tenantLifecycleStage: tenant.settings.dig('core', 'lifecycle_stage')
    }
    if user_id
      msg[:user_id] = user_id
    else
      msg[:anonymous_id] = SecureRandom.base64
    end
    msg
  end

  def tracking_message_for_activity activity
    event = tracking_message(
      "#{activity.item_type} #{activity.action}", 
      user_id: activity.user_id,
      timestamp: activity.acted_at,
      payload: activity.payload
      )

    event[:properties][:item_type] = activity.item_type
    event[:properties][:item_id]   = activity.item_id
    event[:properties][:action]    = activity.action

    if activity.item
      begin
        item_content = serialize "WebApi::V1::External::#{activity.item_type}Serializer", activity.item
        if activity.item.kind_of? Notification
          event[:event] = "Notification for #{activity.item.class::EVENT_NAME} created"
          item_content = item_content.flatten.second
        end
        event[:properties][:item_content] = item_content
      rescue NameError => e
        # There's no serializer, so we don't add anything
      end
    end

    event
  rescue ActiveRecord::RecordNotFound => e
    nil # Tenant can't be found, so we don't send anything
  end

  def serialize serializer_str, object
    serializer = serializer_str.constantize
    ActiveModelSerializers::SerializableResource.new(object, {
      serializer: serializer,
      adapter: :json
      }).serializable_hash
  end

end