class TrackTenantJob < ApplicationJob
  queue_as :default
  # creates or updates tenants in tracking destinations, should be called every tenant change

  def run(user=nil)
    tenant = nil

    begin
      tenant = Tenant.current
      if tenant
        if tenant.has_feature?('intercom')
          intercom_service = TrackIntercomService.new()
          intercom_service.identify_tenant(tenant)
        end
        if tenant.has_feature?('segment')
          segment_service = TrackSegmentService.new()
          segment_service.identify_tenant(user, tenant)
        end
      end
    rescue ActiveRecord::RecordNotFound => e
    end
  end
end
