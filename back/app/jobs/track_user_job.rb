# frozen_string_literal: true

class TrackUserJob < ApplicationJob
  queue_as :default
  # creates or updates users in tracking destinations

  def run(user)
    app_config = AppConfiguration.instance
    TrackIntercomService.new.identify_user(user) if app_config.feature_activated?('intercom')
    PosthogIntegration::TrackPosthogService.new.identify_user(user) if app_config.feature_activated?('posthog_integration')
  end
end
