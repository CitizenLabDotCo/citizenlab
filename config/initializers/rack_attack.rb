class Rack::Attack
  # After https://github.com/rack/rack-attack/blob/master/docs/example_configuration.md

  # Uses cache from environment config file.

  # For all requests.
  throttle('req/ip', limit: 1000, period: 3.minutes) do |req|
    req.ip
  end

  # Signing in by IP.
  throttle('logins/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/user_token' && req.post?
      req.ip
    end
  end

  # Signing in by email account.
  throttle('logins/email', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/user_token' && req.post?
      JSON.parse(req.body.string).dig('auth', 'email')&.to_s&.downcase&.gsub(/\s+/, "")&.presence
    end
  end

  # Account creation by IP.
  throttle('signup/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users' && req.post?
      req.ip
    end
  end

  # Password reset by IP.
  throttle('password_reset/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users/reset_password' && req.post?
      req.ip
    end
  end

  # Password reset email by IP.
  throttle('password_reset_email/ip', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users/reset_password_email' && req.post?
      req.ip
    end
  end

  # Password reset email by email account.
  throttle('password_reset_email/email', limit: 10, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/users/reset_password_email' && req.post?
      byebug
      req.ip
    end
  end

  # Accept invite by email IP.
  throttle('accept_invite/ip', limit: 10, period: 20.seconds) do |req|
    byebug if if req.path,include? '/web_api/v1/invites/by_token'
    if req.path == '/web_api/v1/invites/by_token' && req.post?
      req.ip
    end
  end

end