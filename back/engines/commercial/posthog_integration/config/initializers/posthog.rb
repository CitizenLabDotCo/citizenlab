# frozen_string_literal: true

config_variables = %w[POSTHOG_PROJECT_API_KEY POSTHOG_API_KEY POSTHOG_PROJECT_ID]
config = config_variables.index_with { |var_name| ENV.fetch(var_name, nil) }

if config.values.none? # PostHog integration/tracking is disabled.
  POSTHOG_CLIENT = nil
  POSTHOG_CUSTOM_CLIENT = nil
  return
end

missing_variables = config.select { |_, value| value.nil? }.keys

# We hard fail when the configuration is partial.
if missing_variables.present?
  present_variables = config.keys - missing_variables
  raise <<~ERROR
    Some configuration env variables for the PostHog integration are missing. You can either:
    - Specify the following missing variables: #{missing_variables.join(', ')}.
    - Disable the PostHog integration altogether by removing the following variables: #{present_variables.join(', ')}.
  ERROR
end

config['POSTHOG_HOST'] = ENV.fetch('POSTHOG_HOST', 'https://eu.posthog.com')

# Write-only (project-specific) client for tracking events.
POSTHOG_CLIENT = PostHog::Client.new({
  api_key: config['POSTHOG_PROJECT_API_KEY'],
  host: config['POSTHOG_HOST'],
  on_error: proc { |status, msg| ErrorReporter.report({ status: status, msg: msg }) }
})

# Our own client for all the other PostHog API calls.
POSTHOG_CUSTOM_CLIENT = PosthogIntegration::PostHog::Client.new(
  base_uri: config['POSTHOG_HOST'],
  api_key: config['POSTHOG_API_KEY']
).tap do |client|
  client.default_project_id = config['POSTHOG_PROJECT_ID']
end
