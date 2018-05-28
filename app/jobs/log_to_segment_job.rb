class LogToSegmentJob < ApplicationJob
  queue_as :default

  def perform activity
  	tenant = Tenant.current
    return if !tenant
    service = LogToSegmentService.new

    event = {
      event: service.activity_event_name(activity),
      timestamp: activity.acted_at,
      properties: {
      	source: 'cl2-back'
      }
    }
    if activity.user_id
      event[:user_id] = activity.user_id
    else
    	event[:anonymous_id] = SecureRandom.base64
    end
    service.add_activity_properties event[:properties], activity
    service.add_tenant_properties event[:properties], tenant
    service.add_activity_item_content event, event[:properties], activity

    Analytics.track event
  end

end
