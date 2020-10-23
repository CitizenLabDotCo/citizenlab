class TrackTenantJob < ApplicationJob
  queue_as :default
  # creates or updates tenants in tracking destinations, should be called every tenant change

  def perform(user)
    tenant = nil

    begin
      tenant = Tenant.current
      if tenant
        if tenant.settings.intercom.enabled && tenant.settings.intercom.allowed
          intercom_service = TrackIntercomService.new()
          intercom_service.identify_tenant(user, tenant)
        end
        if tenant.settings.segment.enabled && tenant.settings.segment.allowed
          segment_service = TrackSegmentService.new()
          segment_service.identify_tenant(user, tenant)
        end
      end
    rescue ActiveRecord::RecordNotFound => e
    end
  end
end
