# frozen_string_literal: true

module Middleware
  # Strips blank entries from forwarded-IP headers before Rails resolves the remote IP.
  # A malformed `X-Forwarded-For` (e.g. `"1.2.3.4, "`) otherwise feeds an empty string to
  # cloudfront-rails' `IPAddr.new`, raising IPAddr::InvalidAddressError as a 500 that runs
  # in middleware, before any controller, so `rescue_from` can't catch it.
  class SanitizeForwardedFor
    FORWARDED_HEADERS = %w[HTTP_X_FORWARDED_FOR HTTP_CLIENT_IP HTTP_X_CLIENT_IP].freeze

    def initialize(app)
      @app = app
    end

    def call(env)
      FORWARDED_HEADERS.each { |header| sanitize!(env, header) }
      @app.call(env)
    end

    private

    def sanitize!(env, header)
      value = env[header]
      return unless value.is_a?(String)

      cleaned = value.split(',').map(&:strip).reject(&:empty?)
      if cleaned.empty?
        env.delete(header)
      else
        env[header] = cleaned.join(', ')
      end
    end
  end
end
