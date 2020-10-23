class TrackEventJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def perform activity
    tenant = nil

    begin
      tenant = Tenant.current
      if tenant
        if tenant.settings.intercom.enabled && tenant.settings.intercom.allowed
          intercom_service = TrackIntercomService.new()
          intercom_service.track(activity)
        end
        if tenant.settings.segment.enabled && tenant.settings.segment.allowed
          segment_service = TrackSegmentService.new()
          segment_service.track(activity)
        end
      end
    rescue ActiveRecord::RecordNotFound => e
    end
  end
end
