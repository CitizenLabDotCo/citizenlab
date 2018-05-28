class LogToSegmentService

  def activity_event_name activity
    "#{activity.item_type} #{activity.action}"
  end

  def add_tenant_properties hash, tenant
    hash[:tenantId]               = tenant.id
    hash[:tenantName]             = tenant.name
    hash[:tenantHost]             = tenant.host
    hash[:tenantOrganizationType] = tenant.settings.dig('core', 'organization_type')
    hash[:tenantLifecycleStage]   = tenant.settings.dig('core', 'lifecycle_stage')
  end

  def add_activity_properties hash, activity
    hash[:item_type] = activity.item_type
    hash[:item_id]   = activity.item_id
    hash[:action]    = activity.action
    hash[:payload]   = activity.payload
  end

  def add_activity_item_content hash_for_event, hash_for_item_content, activity
    if activity.item
      begin
        item_content = serialize "WebApi::V1::External::#{activity.item_type}Serializer", activity.item
        if activity.item.kind_of? Notification
          hash_for_event[:event] = "Notification for #{activity.item.class::EVENT_NAME} created"
          item_content = item_content.flatten.second
        end
        hash_for_item_content[:item_content] = item_content
      rescue NameError => e
        # There's no serializer, so we don't add anything
      end
    end
  end

  def serialize serializer_str, object
    serializer = serializer_str.constantize
    ActiveModelSerializers::SerializableResource.new(object, {
      serializer: serializer,
      adapter: :json
      }).serializable_hash
  end

end