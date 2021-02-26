# frozen_string_literal: true

class TrackingService
  def activity_event_name(activity)
    if activity.item.respond_to? :event_bus_item_name
      "#{activity.item.event_bus_item_name} #{activity.action}"
    else
      "#{activity.item_type} #{activity.action}"
    end
  end

  def activity_properties(activity)
    {
      item_type: activity.item_type,
      item_id: activity.item_id,
      action: activity.action,
      payload: activity.payload
    }
  end

  def activity_item_content(activity)
    return {} unless activity.item

    serializer = begin
      "WebApi::V1::External::#{activity.item_type}Serializer".constantize
    rescue NameError
      return {}
    end

    if activity.item.respond_to? :event_bus_item_content
      activity.item.event_bus_item_content
    else
      serialize serializer, activity.item
    end
  end

  def serialize(serializer, object)
    ActiveModelSerializers::SerializableResource.new(object, {
      serializer: serializer,
      adapter: :json
    }).serializable_hash
  end
end
