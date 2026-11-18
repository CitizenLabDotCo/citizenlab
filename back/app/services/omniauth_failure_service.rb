# frozen_string_literal: true

# Reports OmniAuth failures: strategy failures, and users from the SSO callback that cannot be saved.
class OmniauthFailureService
  # Runs from the `on_failure` hook, the only place the error exists: OmniAuth
  # then redirects to /auth/failure without it.
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

  # Users rejected by our email rules (blocked domain, banned email) are expected,
  # so they are logged as an activity, not reported. Any other validation error
  # may mean the SSO method is misconfigured, so it is reported, grouped per
  # provider and error.
  def report_invalid_record(error, provider, remote_ip)
    record = error.record
    if record.is_a?(User) && only_blocked_email_errors?(record)
      SideFxUserService.new.after_error(record, remote_ip)
      return
    end

    validation_errors = record.errors.details.flat_map do |attribute, details|
      details.map { |detail| "#{attribute}.#{validation_error_key(detail[:error])}" }
    end.uniq.sort

    ErrorReporter.report(
      error,
      extra: { provider: provider, record: record.class.name, validation_errors: validation_errors },
      fingerprint: ['omniauth-invalid-record', provider, record.class.name, *validation_errors]
    )
  end

  private

  def only_blocked_email_errors?(user)
    details = user.errors.details.values.flatten
    details.any? && details.all? do |detail|
      detail[:code].in?([User::EMAIL_DOMAIN_BLOCKED_ERROR_CODE, User::EMAIL_BANNED_ERROR_CODE])
    end
  end

  # JsonValidator adds a Hash whose message can hold the value; group on its error name only.
  def validation_error_key(error)
    error.is_a?(Hash) ? error[:error] : error
  end

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
