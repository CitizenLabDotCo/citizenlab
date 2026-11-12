# frozen_string_literal: true

# Reports OmniAuth strategy failures. It runs from OmniAuth's `on_failure` hook
# because the error only exists on the Rack env of the failing request: OmniAuth
# then redirects to /auth/failure, which is a new request without it.
class OmniauthFailureService
  def report(env)
    error = env['omniauth.error']
    error_type = env['omniauth.error.type']&.to_s
    strategy = env['omniauth.error.strategy']&.name&.to_s
    extra = extra(env, error, error_type, strategy)

    # The error type often comes from the `error` param of the callback URL, so
    # it is a tag rather than part of the fingerprint: anyone could otherwise
    # open a new Sentry issue per request.
    Sentry.set_tags(omniauth_error_type: error_type)
    fingerprint = ['omniauth-failure', strategy || 'unknown', error&.class&.name || 'none']

    if error
      ErrorReporter.report(error, extra: extra, fingerprint: fingerprint)
    else
      ErrorReporter.report_msg("OmniAuth failure: #{error_type || 'unknown'}", extra: extra, fingerprint: fingerprint)
    end
  rescue StandardError => e
    # Reporting must never stop OmniAuth from redirecting the user to the failure page.
    Rails.logger.error("Could not report OmniAuth failure: #{e.class}: #{e.message}")
  end

  private

  # When omniauth fails inside an HTTP exchange (e.g. Rack::OAuth2::Client::Error
  # when the IDP/WAF returns HTML instead of JSON for the token request), the
  # exception's #message is often just "Unknown :: <html>…</html>". Surface the
  # status, response body and underlying cause so Sentry shows what actually
  # came back from the IDP.
  def extra(env, error, error_type, strategy)
    # The tenant tag is set by a controller, which has not run yet at this point.
    extra = { error_type: error_type, strategy: strategy, host: Rack::Request.new(env).host }
    return extra unless error

    extra[:http_status] = error.status if error.respond_to?(:status)
    if error.respond_to?(:response) && error.response.is_a?(Hash)
      response_body = error.response[:error_description] || error.response[:body]
      extra[:response_body] = response_body.to_s.first(2000) if response_body.present?
    end
    if error.cause
      extra[:cause_class] = error.cause.class.name
      extra[:cause_message] = error.cause.message
    end
    extra
  end
end
