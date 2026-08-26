# frozen_string_literal: true

Rack::Attack.enabled = ENV.fetch('RACK_ATTACK_DISABLED', false) != 'true'

# Rack::Attack uses rack's request object by default. This doesn't have a
# properly built-in mechanism to detect the users real IP, in case the
# application is behind a reverse proxy (cdn, load balancer, ...).
# ActionDispatch `remote_ip` method supports it, if it has the IPs of those
# proxies configured in `config.action_dispatch.trusted_proxies`
# from https://github.com/rack/rack-attack/issues/145
class Rack::Attack
  class Request < ::Rack::Request
    def remote_ip
      @remote_ip ||= ActionDispatch::Request.new(env).remote_ip
    end
  end
end

class Rack::Attack
  # After https://github.com/rack/rack-attack/blob/master/docs/example_configuration.md

  # Whitelist an IP, which we are using for prerendering
  if (safe_ip = ENV.fetch('RACK_ATTACK_SAFELIST_IP', nil))
    safelist_ip(safe_ip)
  end

  # The user ID a request authenticates as, reading params[:token] before the header like AuthToken::Authenticable#token.
  USER_ID_FROM_JWT = lambda do |req|
    jwt = req.params['token'].presence || req.env['HTTP_AUTHORIZATION']&.split&.last
    JWT.decode(jwt, nil, false, algorithm: 'RS256').first['sub'] # sub is the user ID
  rescue JWT::DecodeError
    nil
  end

  # For all requests.
  throttle('req/ip', limit: 1000, period: 3.minutes) do |req|
    req.remote_ip
  end

  # Signing in by IP.
  throttle('logins/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/user_token' && req.post?
      req.remote_ip
    end
  end

  throttle('logins/ip/day', limit: 4000, period: 24.hours) do |req|
    if req.path == '/web_api/v1/user_token' && req.post?
      req.remote_ip
    end
  end

  # Signing in by email account.
  throttle('logins/email', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/user_token' && req.post?
      begin
        JSON.parse(req.body.string).dig('auth', 'email')&.to_s&.downcase&.gsub(/\s+/, '')&.presence
      rescue JSON::ParserError
        # do nothing
      end
    end
  end

  throttle('logins/email/day', limit: 100, period: 24.hours) do |req|
    if req.path == '/web_api/v1/user_token' && req.post?
      begin
        JSON.parse(req.body.string).dig('auth', 'email')&.to_s&.downcase&.gsub(/\s+/, '')&.presence
      rescue JSON::ParserError
        # do nothing
      end
    end
  end

  # Signing in with a phone number by IP.
  throttle('logins_phone/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/user_token_phone' && req.post?
      req.remote_ip
    end
  end

  throttle('logins_phone/ip/day', limit: 4000, period: 24.hours) do |req|
    if req.path == '/web_api/v1/user_token_phone' && req.post?
      req.remote_ip
    end
  end

  # Signing in by phone number.
  throttle('logins/phone', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/user_token_phone' && req.post?
      begin
        JSON.parse(req.body.string).dig('auth', 'phone')&.to_s&.gsub(/\s+/, '')&.presence
      rescue JSON::ParserError
        # do nothing
      end
    end
  end

  throttle('logins/phone/day', limit: 100, period: 24.hours) do |req|
    if req.path == '/web_api/v1/user_token_phone' && req.post?
      begin
        JSON.parse(req.body.string).dig('auth', 'phone')&.to_s&.gsub(/\s+/, '')&.presence
      rescue JSON::ParserError
        # do nothing
      end
    end
  end

  # Account creation by IP.
  throttle('signup/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users' && req.post?
      req.remote_ip
    end
  end

  # Account creation with a phone number by IP.
  throttle('signup_phone/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users/create_phone' && req.post?
      req.remote_ip
    end
  end

  # Password reset by IP.
  throttle('password_reset/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users/reset_password' && req.post?
      req.remote_ip
    end
  end

  # Password reset email by IP.
  throttle('password_reset_email/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users/reset_password_email' && req.post?
      req.remote_ip
    end
  end

  # Password reset email by email account.
  throttle('password_reset_email/email', limit: 1, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users/reset_password_email' && req.post?
      begin
        JSON.parse(req.body.string).dig('user', 'email')&.to_s&.downcase&.gsub(/\s+/, '')&.presence
      rescue JSON::ParserError
        # do nothing
      end
    end
  end

  # Accept invite by IP.
  throttle('accept_invite/ip', limit: 10, period: 20.seconds) do |req|
    if req.path.starts_with?('/web_api/v1/invites/by_token') && req.path.ends_with?('accept') && req.post?
      req.remote_ip
    end
  end

  # Temporary solution: Enable throttling for search requests.
  # Search parameters are used for ideas, users, invites, moderation and tags.
  throttle('search/ip', limit: 15, period: 20.seconds) do |req|
    if req.params['search'].present?
      req.remote_ip
    end
  end

  # Confirmation codes: requesting one and confirming one. Both are expensive
  # (an email or an SMS goes out) and both are attack surface (code guessing,
  # account enumeration, using the platform as a mailer), so every endpoint below
  # is throttled on the caller it is actually about:
  #   - the identifier in the request body (email / phone / new_email /
  #     new_phone), which is what an attacker rotating IPs would hold fixed;
  #   - the authenticated user, for the endpoints that act on current_user.
  # A request is counted against both keys when both apply, and each key gets a
  # burst limit and a longer window. The endpoints that take no identifier (the
  # `code`-only confirmations and the re-confirmations) are keyed on the user
  # only. IP is deliberately not one of these keys - see the separate, looser
  # per-IP throttle below.
  CONFIRMATION_CODE_ENDPOINTS = {
    '/web_api/v1/user/request_code_email' => %w[request_code email],
    '/web_api/v1/user/request_code_new_email' => %w[request_code new_email],
    '/web_api/v1/user/request_code_phone' => %w[request_code phone],
    '/web_api/v1/user/request_code_new_phone' => %w[request_code new_phone],
    '/web_api/v1/user/request_reconfirm_code_email' => nil,
    '/web_api/v1/user/request_reconfirm_code_phone' => nil,
    '/web_api/v1/user/confirm_code_email' => %w[confirmation email],
    '/web_api/v1/user/confirm_code_new_email' => nil,
    '/web_api/v1/user/confirm_code_phone' => %w[confirmation phone],
    '/web_api/v1/user/confirm_code_new_phone' => nil,
    '/web_api/v1/user/reconfirm_code_email' => nil,
    '/web_api/v1/user/reconfirm_code_phone' => nil
  }.freeze

  CONFIRMATION_CODE_LIMITS = { '5s' => [1, 5.seconds], '2min' => [5, 2.minutes] }.freeze

  # The identifier a request is about, read from its JSON body. Normalized so that
  # casing and spacing can't be used to get a fresh counter: `A@B.com` and
  # `a@b.com` are one key, and so are `+32 470 12 34 56` and `+32470123456`.
  CONFIRMATION_CODE_IDENTIFIER = lambda do |req, root, key|
    JSON.parse(req.body.string).dig(root, key)&.to_s&.downcase&.gsub(/\s+/, '')&.presence
  rescue JSON::ParserError
    nil
  end

  CONFIRMATION_CODE_ENDPOINTS.each do |path, identifier|
    endpoint = path.split('/').last

    CONFIRMATION_CODE_LIMITS.each do |window, (limit, period)|
      throttle("#{endpoint}/user/#{window}", limit: limit, period: period) do |req|
        USER_ID_FROM_JWT.call(req) if req.path == path && req.post?
      end

      next unless identifier

      throttle("#{endpoint}/#{identifier.last}/#{window}", limit: limit, period: period) do |req|
        CONFIRMATION_CODE_IDENTIFIER.call(req, *identifier) if req.path == path && req.post?
      end
    end
  end

  # The same endpoints by IP. An IP is a much blunter key than the two above: a
  # school or an office is one IP for everyone behind it, so a limit tight enough
  # to be interesting against an attacker mostly hits bystanders. This one is a
  # backstop against a single host hammering an endpoint, and is deliberately kept
  # looser than the per-identifier and per-user limits.
  CONFIRMATION_CODE_ENDPOINTS.each_key do |path|
    throttle("#{path.split('/').last}/ip", limit: 5, period: 20.seconds) do |req|
      req.remote_ip if req.path == path && req.post?
    end
  end

  # User check endpoints
  throttle('user_check/ip', limit: 5, period: 2.minutes) do |req|
    if req.path == '/web_api/v1/users/check_email' && req.post?
      req.remote_ip
    end
  end

  throttle('user_check/email', limit: 5, period: 5.minutes) do |req|
    if req.path == '/web_api/v1/users/check_email' && req.post?
      begin
        JSON.parse(req.body.string).dig('user', 'email')&.to_s&.downcase&.gsub(/\s+/, '')&.presence
      rescue JSON::ParserError
        # do nothing
      end
    end
  end

  throttle('user_check_phone/ip', limit: 5, period: 2.minutes) do |req|
    if req.path == '/web_api/v1/users/check_phone' && req.post?
      req.remote_ip
    end
  end

  throttle('user_check_phone/phone', limit: 5, period: 5.minutes) do |req|
    if req.path == '/web_api/v1/users/check_phone' && req.post?
      begin
        JSON.parse(req.body.string).dig('user', 'phone')&.to_s&.gsub(/\s+/, '')&.presence
      rescue JSON::ParserError
        # do nothing
      end
    end
  end

  # Machine translations by IP.
  throttle('translate/id', limit: 10, period: 20.seconds) do |req|
    if %r{/web_api/v1/.+/machine_translation}.match?(req.path)
      req.remote_ip
    end
  end

  # Authoring assistance responses by IP.
  throttle('authoring/ip', limit: 10, period: 20.seconds) do |req|
    if %r{/web_api/v1/ideas/.+/authoring_assistance_responses}.match?(req.path) && req.post?
      req.remote_ip
    end
  end

  # Similar inputs responses by IP.
  throttle('similar_ideas/ip', limit: 5, period: 1.second) do |req|
    if %r{\A/web_api/v1/phases/[^/]+/inputs/similar\z}.match?(req.path) && req.post?
      req.remote_ip
    end
  end

  # OAuth Dynamic Client Registration by IP.
  throttle('oauth_registrations/ip', limit: 5, period: 1.minute) do |req|
    if req.path == '/oauth/registrations' && req.post?
      req.remote_ip
    end
  end

  throttle('oauth_registrations/ip/day', limit: 50, period: 24.hours) do |req|
    if req.path == '/oauth/registrations' && req.post?
      req.remote_ip
    end
  end

  # Spam reports by IP. Limits are well above plausible human volume: this runs
  # before authentication, so an office behind a single NAT is one key.
  throttle('spam_reports/ip', limit: 10, period: 1.minute) do |req|
    if %r{\A/web_api/v1/(ideas|comments)/[^/]+/spam_reports\z}.match?(req.path) && req.post?
      req.remote_ip
    end
  end

  throttle('spam_reports/ip/day', limit: 100, period: 24.hours) do |req|
    if %r{\A/web_api/v1/(ideas|comments)/[^/]+/spam_reports\z}.match?(req.path) && req.post?
      req.remote_ip
    end
  end
end
