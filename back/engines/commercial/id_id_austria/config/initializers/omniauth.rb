# frozen_string_literal: true

CRIIPTO_SETUP_PROC = lambda do |env|
  IdIdAustria::IdAustriaOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: CRIIPTO_SETUP_PROC, name: 'id_austria', issuer: IdIdAustria::IdAustriaOmniauth.new.method(:issuer)
end
