# frozen_string_literal: true

class PublishRawEventToSegmentJob < ApplicationJob
  queue_as :default

  def run(event)
    service = TrackingService.new

    begin
      tenant = Tenant.current
      event[:properties] ||= {}
      event[:properties]
        .merge(service.tenant_properties(tenant))
        .merge(service.environment_properties)
    rescue ActiveRecord::RecordNotFound
      # Tenant can't be found, so we don't add anything
    end

    Analytics.track(event)
  end
end
