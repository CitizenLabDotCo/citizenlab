# frozen_string_literal: true

module Webhooks
  class PayloadService
    def generate(activity)
      {
        id: activity.id,
        event_type: event_type(activity),
        acted_at: activity.acted_at.iso8601,
        action: activity.action,
        user_id: activity.user_id,
        project_id: activity.project_id,
        tenant_id: Tenant.current.id,
        item_type: activity.item_type,
        item_id: activity.item_id,
        item: serialize_item(activity)
      }
    end

    private

    def event_type(activity)
      "#{activity.item_type.underscore}.#{activity.action.underscore}"
    end

    def serialize_item(activity)
      return {} unless activity.item

      serializer_class = "PublicApi::V2::#{activity.item_type}Serializer".constantize
      ActiveModelSerializers::SerializableResource.new(activity.item, {
        serializer: serializer_class,
        adapter: :attributes
      }).serializable_hash
    rescue NameError
      {}
    end
  end
end
