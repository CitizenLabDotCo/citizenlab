class TrackEventJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def perform(activity)
    return unless (tenant = Tenant.current)
    TrackIntercomService.new.track(activity, tenant) if tenant.has_feature?('intercom')
    TrackSegmentService.new.track_activity(activity) if tenant.has_feature?('segment')
  rescue ActiveRecord::RecordNotFound => e
    # Ignored
  end
end
