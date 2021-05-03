Rack::Attack.class_eval do
  # After https://github.com/rack/rack-attack/blob/master/docs/example_configuration.md

  # Uses cache from environment config file.

  # For all requests.
  throttle('user/resend_code', limit: 10, period: 5.minutes) do |req|
    if req.path == '/web_api/v1/user/resend_code' && req.post?
      req.ip
    end
  end

  # Signing in by IP.
  throttle('user/confirm', limit: 5, period: 20.seconds) do |req|
    if req.path == '/web_api/v1/user/confirm' && req.post?
      req.ip
    end
  end
end
