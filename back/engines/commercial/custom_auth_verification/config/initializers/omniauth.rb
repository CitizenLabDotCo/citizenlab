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

# TODO: JS - auth0 does not work
# AUTH0_SETUP_PROC = lambda do |env|
#   CustomAuthVerification::Auth0Omniauth.new.omniauth_setup(AppConfiguration.instance, env)
# end
#
# Rails.application.config.middleware.use OmniAuth::Builder do
#   provider :auth0, setup: AUTH0_SETUP_PROC, name: 'auth0'
# end

BOSA_FAS_SETUP_PROC = lambda do |env|
  CustomAuthVerification::BosaFasOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: BOSA_FAS_SETUP_PROC, name: 'bosa_fas'
end

CLAVE_UNICA_SETUP_PROC = lambda do |env|
  CustomAuthVerification::ClaveUnicaOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: CLAVE_UNICA_SETUP_PROC, name: 'clave_unica', issuer: CustomAuthVerification::ClaveUnicaOmniauth.new.method(:issuer)
end

CRIIPTO_SETUP_PROC = lambda do |env|
  CustomAuthVerification::CriiptoOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: CRIIPTO_SETUP_PROC, name: 'criipto', issuer: CustomAuthVerification::CriiptoOmniauth.new.method(:issuer)
end

FRANCECONNECT_SETUP_PROC = lambda do |env|
  CustomAuthVerification::FranceconnectOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: FRANCECONNECT_SETUP_PROC, name: 'franceconnect', issuer: CustomAuthVerification::FranceconnectOmniauth.new.method(:issuer)
end