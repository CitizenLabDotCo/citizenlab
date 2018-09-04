class LogToSegmentService

  def activity_event_name activity
    if activity.item&.respond_to? :event_bus_item_name
      "#{activity.item.event_bus_item_name} #{activity.action}"
    else
      "#{activity.item_type} #{activity.action}"
    end
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
      serializer = nil
      begin
        serializer = "WebApi::V1::External::#{activity.item_type}Serializer".constantize
      rescue NameError => e
        # There's no serializer, so we don't add anything
      end
      if serializer
        hash_for_item_content[:item_content] =
          if activity.item.respond_to? :event_bus_item_content
            activity.item.event_bus_item_content
          else
            serialize serializer, activity.item
          end
      end
    end
  end

  def serialize serializer, object
    ActiveModelSerializers::SerializableResource.new(object, {
      serializer: serializer,
      adapter: :json
      }).serializable_hash
  end

end