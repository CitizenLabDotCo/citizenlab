# frozen_string_literal: true

class TrackEventJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def run(activity)
    app_config = AppConfiguration.instance
  rescue ActiveRecord::RecordNotFound
    # Ignored
    # TODO We'd better not silently ignore those events
  else
    TrackIntercomService.new.track_activity(activity) if app_config.feature_activated?('intercom')
    TrackSegmentService.new.track_activity(activity)  if app_config.feature_activated?('segment')
  end
end
