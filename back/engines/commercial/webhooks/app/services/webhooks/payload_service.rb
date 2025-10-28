# frozen_string_literal: true

module Webhooks
  class PayloadService
    def generate(activity)
      {
        id: activity.id,
        event: event_name(activity),
        event_type: routing_key(activity),
        timestamp: activity.acted_at.iso8601,
        data: serialize_item(activity),
        metadata: {
          item_type: activity.item_type,
          item_id: activity.item_id,
          action: activity.action,
          user_id: activity.user_id,
          project_id: activity.project_id,
          tenant_id: Tenant.current.id
        }
      }
    end

    private

    def event_name(activity)
      TrackingService.new.activity_event_name(activity)
    end

    def routing_key(activity)
      "#{activity.item_type.underscore}.#{activity.action.underscore}"
    end

    def serialize_item(activity)
      return {} unless activity.item

      serializer_class = "WebApi::V1::External::#{activity.item_type}Serializer".constantize
      TrackingService.new.serialize(serializer_class, activity.item)
    rescue NameError
      {}
    end
  end
end
