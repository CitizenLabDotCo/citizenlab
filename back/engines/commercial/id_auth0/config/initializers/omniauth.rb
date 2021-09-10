# frozen_string_literal: true

AUTH0_SETUP_PROC = lambda do |env|
  IdAuth0::Auth0Omniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :auth0, setup: AUTH0_SETUP_PROC, name: 'auth0'
end
