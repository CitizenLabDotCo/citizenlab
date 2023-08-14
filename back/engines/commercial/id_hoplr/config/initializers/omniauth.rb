# frozen_string_literal: true

HOPLR_SETUP_PROC = lambda do |env|
  IdHoplr::HoplrOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: HOPLR_SETUP_PROC, name: 'hoplr', issuer: IdHoplr::HoplrOmniauth.new.method(:issuer)
end
