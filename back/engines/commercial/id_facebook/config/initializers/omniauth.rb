# frozen_string_literal: true

FACEBOOK_SETUP_PROC = lambda do |env|
  IdFacebook::FacebookOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, setup: FACEBOOK_SETUP_PROC
end
