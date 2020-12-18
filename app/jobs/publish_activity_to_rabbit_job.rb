class PublishActivityToRabbitJob < ApplicationJob
  queue_as :default

  def perform(activity)
    event = activity_to_event(activity)
    routing_key = "#{activity.item_type.underscore}.#{activity.action.underscore}"
    PublishGenericEventToRabbitJob.perform_now(event, routing_key)
  end

  private

  def activity_to_event(activity)
    service = TrackingService.new
    event = {
        event: service.activity_event_name(activity),
        timestamp: activity.acted_at,
        **service.activity_properties(activity),
        **service.environment_properties,
        item_content: service.activity_item_content(activity)
    }
    event[:user_id] = activity.user_id if activity.user_id
    event
  end

end
