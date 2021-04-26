class Rack::Attack
  # After https://github.com/rack/rack-attack/blob/master/docs/example_configuration.md

  # Uses cache from environment config file.

  # For all requests.
  throttle('user/resend_code', limit: 10, period: 5.minutes) do |req|
    req.ip
  end

  # Signing in by IP.
  throttle('user/confirm', limit: 5, period: 20.seconds) do |req|
    req.ip
  end
end
