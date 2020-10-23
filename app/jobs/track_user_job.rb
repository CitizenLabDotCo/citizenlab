class TrackUserJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def perform(user)
    tenant = nil

    begin
      tenant = Tenant.current
      if tenant
        if tenant.settings.intercom.enabled && tenant.settings.intercom.allowed
          intercom_service = TrackIntercomService.new()
          intercom_service.identify_user(user, tenant)
        end
        if tenant.settings.segment.enabled && tenant.settings.segment.allowed
          segment_service = TrackSegmentService.new()
          segment_service.identify_user(user, tenant)
        end
      end
    rescue ActiveRecord::RecordNotFound => e
    end
  end
end
