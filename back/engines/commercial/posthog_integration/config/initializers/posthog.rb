# frozen_string_literal: true

key = ENV.fetch('POSTHOG_API_KEY', nil)

POSTHOG_CLIENT = key &&
                 PostHog::Client.new({
                   api_key: key,
                   host: 'https://eu.posthog.com',
                   on_error: proc { |status, msg| ErrorReporter.report({ status: status, msg: msg }) }
                 })
