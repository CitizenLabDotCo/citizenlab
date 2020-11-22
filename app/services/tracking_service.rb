class TrackingService

  def activity_event_name activity
    if activity.item&.respond_to? :event_bus_item_name
      "#{activity.item.event_bus_item_name} #{activity.action}"
    else
      "#{activity.item_type} #{activity.action}"
    end
  end

  def tenant_properties tenant
    {
      tenantId:               tenant.id,
      tenantName:             tenant.name,
      tenantHost:             tenant.host,
      tenantOrganizationType: tenant.settings.dig('core', 'organization_type'),
      tenantLifecycleStage:   tenant.settings.dig('core', 'lifecycle_stage'),
    }
  end

  def activity_properties activity
    {
      item_type: activity.item_type,
      item_id:   activity.item_id,
      action:    activity.action,
      payload:   activity.payload,
    }
  end

  def activity_item_content activity
    return {} if !activity.item

    serializer = begin
      "WebApi::V1::External::#{activity.item_type}Serializer".constantize
    rescue NameError => e
      return {}
    end

    if activity.item.respond_to? :event_bus_item_content
      activity.item.event_bus_item_content
    else
      serialize serializer, activity.item
    end
  end

  def environment_properties
    {
      cl2_cluster: CL2_CLUSTER
    }
  end

  def serialize serializer, object
    ActiveModelSerializers::SerializableResource.new(object, {
      serializer: serializer,
      adapter: :json
      }).serializable_hash
  end

end
