class PublishRawEventToSegmentJob < ApplicationJob
  queue_as :default

  def perform(event)
    service = LogToSegmentService.new
    
    begin
      tenant = Tenant.current
      event[:properties] = service.add_tenant_properties(event[:properties] || {})
    rescue  ActiveRecord::RecordNotFound => e
      # Tenant can't be found, so we don't add anything
    end
    Analytics.track(event) if Analytics
  end

end
