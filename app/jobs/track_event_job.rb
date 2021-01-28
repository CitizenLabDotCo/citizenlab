class TrackEventJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def perform(activity)
    tenant = Tenant.current
    TrackIntercomService.new.track(activity, tenant) if AppConfiguration.instance.has_feature?('intercom')
    TrackSegmentService.new.track_activity(activity) if AppConfiguration.instance.has_feature?('segment')
  rescue ActiveRecord::RecordNotFound
    # Ignored
  end
end
