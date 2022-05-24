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

  # Uses cache from environment config file.

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

  # Account creation by IP.
  throttle('signup/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users' && req.post?
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
    if req.path.starts_with?('/web_api/v1/invites/by_token') &&  req.path.ends_with?('accept') && req.post?
      req.remote_ip
    end
  end

  # Temporary solution: Enable throttling for search requests.
  # Search parameters are used for ideas, initiatives, users, invites, moderation and tags.
  throttle('search/ip', limit: 15, period: 20.seconds) do |req|
    if req.params['search'].present?
      req.remote_ip
    end
  end
end
