class TrackEventJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def run(activity)
    app_config = AppConfiguration.instance
    TrackIntercomService.new.track_activity(activity) if app_config.feature_activated?('intercom')
    TrackSegmentService.new.track_activity(activity)  if app_config.feature_activated?('segment')
  end
end
