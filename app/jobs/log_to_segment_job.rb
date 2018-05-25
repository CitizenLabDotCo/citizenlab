class LogToSegmentJob < ApplicationJob
  queue_as :default

  def perform(activity)
    event = LogToSegmentService.new.tracking_message(
      "#{activity.item_type} #{activity.action}", 
      user_id: activity.user_id,
      timestamp: activity.acted_at,
      payload: activity.payload
      )

    event[:properties][:item_type] = activity.item_type
    event[:properties][:item_id]   = activity.item_id
    event[:properties][:action]    = activity.action

    if activity.item
      serializer = "WebApi::V1::External::#{activity.item_type}Serializer".constantize
      serialization = ActiveModelSerializers::SerializableResource.new(activity.item, {
        serializer: serializer,
        adapter: :json
      })
      item_content = serialization.serializable_hash
      if activity.item.kind_of? Notification
        event[:event] = "Notification for #{activity.item.class::EVENT_NAME} created"
        item_content = item_content.flatten.second
      end
      event[:properties][:item_content] = item_content
    end

    Analytics.track(event)
  rescue NameError => e
    # There's no serializer, so we don't add anything
  end

end
