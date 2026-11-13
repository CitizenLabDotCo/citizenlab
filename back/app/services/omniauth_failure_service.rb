# frozen_string_literal: true

# Reports OmniAuth strategy failures from the `on_failure` hook, the only place
# the error exists: OmniAuth then redirects to /auth/failure without it.
class OmniauthFailureService
  def report(env)
    error = env['omniauth.error']
    error_type = env['omniauth.error.type']&.to_s
    strategy = env['omniauth.error.strategy']&.name&.to_s
    extra = extra(env, error, error_type, strategy)

    # The error type can come from the callback URL, so it is a tag, not part of
    # the fingerprint, or anyone could create new Sentry issues.
    Sentry.set_tags(omniauth_error_type: error_type)
    fingerprint = ['omniauth-failure', strategy || 'unknown', error&.class&.name || 'none']

    if error
      ErrorReporter.report(error, extra: extra, fingerprint: fingerprint)
    else
      ErrorReporter.report_msg("OmniAuth failure: #{error_type || 'unknown'}", extra: extra, fingerprint: fingerprint)
    end
  rescue StandardError => e
    # Never let reporting stop the redirect to the failure page.
    Rails.logger.error("Could not report OmniAuth failure: #{e.class}: #{e.message}")
  end

  private

  # HTTP errors from the IDP often have a useless message (e.g. "Unknown :: <html>…"),
  # so add the status, response body and cause.
  def extra(env, error, error_type, strategy)
    # No tenant tag yet: it is set by a controller, which has not run.
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
