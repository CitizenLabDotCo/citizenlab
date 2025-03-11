# frozen_string_literal: true

GOOGLE_SETUP_PROC = lambda do |env|
  IdGoogle::GoogleOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, setup: GOOGLE_SETUP_PROC, name: 'google'
end
