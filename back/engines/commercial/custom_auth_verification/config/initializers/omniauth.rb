# frozen_string_literal: true

FAKE_SSO_SETUP_PROC = lambda do |env|
  CustomAuthVerification::FakeSsoOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: FAKE_SSO_SETUP_PROC, name: 'fake_sso', issuer: CustomAuthVerification::FakeSsoOmniauth.new.method(:issuer)
end

KEYCLOAK_SETUP_PROC = lambda do |env|
  CustomAuthVerification::KeycloakOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: KEYCLOAK_SETUP_PROC, name: 'keycloak', issuer: CustomAuthVerification::KeycloakOmniauth.new.method(:issuer)
end
