# frozen_string_literal: true

FRANCECONNECT_SETUP_PROC = lambda do |env|
  IdFranceconnect::FranceconnectOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, :setup => FRANCECONNECT_SETUP_PROC, name: 'franceconnect', issuer: IdFranceconnect::FranceconnectOmniauth.new.method(:issuer)
end
