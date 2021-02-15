class PublishActivityToRabbitJob < ApplicationJob
  queue_as :default

  def run(activity)
    event = event_from(activity)
    routing_key = routing_key_from(activity)
    PublishGenericEventToRabbitJob.perform_now(event, routing_key)
  end

  private

  def routing_key_from(activity)
    "#{activity.item_type.underscore}.#{activity.action.underscore}"
  end

  def event_from(activity)
    service = TrackingService.new

    event = {
        event: service.activity_event_name(activity),
        timestamp: activity.acted_at,
        **service.activity_properties(activity),
        **service.environment_properties,
        item_content: service.activity_item_content(activity)
    }.tap do |event|
      event[:user_id] = activity.user_id if activity.user_id
    end
  end

end
