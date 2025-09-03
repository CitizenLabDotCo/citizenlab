# frozen_string_literal: true

TWODAY_SETUP_PROC = lambda do |env|
  IdTwoday::TwodayOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: TWODAY_SETUP_PROC, name: 'twoday', issuer: IdTwoday::TwodayOmniauth.new.method(:issuer)
end
