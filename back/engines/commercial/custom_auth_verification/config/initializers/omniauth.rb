# frozen_string_literal: true

FAKE_SSO_SETUP_PROC = ->(env) { CustomAuthVerification::FakeSsoOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
KEYCLOAK_SETUP_PROC = ->(env) { CustomAuthVerification::KeycloakOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
BOSA_FAS_SETUP_PROC = ->(env) { CustomAuthVerification::BosaFasOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
CLAVE_UNICA_SETUP_PROC = ->(env) { CustomAuthVerification::ClaveUnicaOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
CRIIPTO_SETUP_PROC = ->(env) { CustomAuthVerification::CriiptoOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
FRANCECONNECT_SETUP_PROC = ->(env) { CustomAuthVerification::FranceconnectOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
ID_AUSTRIA_SETUP_PROC = ->(env) { CustomAuthVerification::IdAustriaOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
TWODAY_SETUP_PROC = ->(env) { CustomAuthVerification::TwodayOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
AUTH0_SETUP_PROC = ->(env) { CustomAuthVerification::Auth0Omniauth.new.omniauth_setup(AppConfiguration.instance, env) }
HOPLR_SETUP_PROC = lambda { |env| CustomAuthVerification::HoplrOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: FAKE_SSO_SETUP_PROC, name: 'fake_sso', issuer: CustomAuthVerification::FakeSsoOmniauth.new.method(:issuer)
  provider :openid_connect, setup: KEYCLOAK_SETUP_PROC, name: 'keycloak', issuer: CustomAuthVerification::KeycloakOmniauth.new.method(:issuer)
  provider :openid_connect, setup: BOSA_FAS_SETUP_PROC, name: 'bosa_fas'
  provider :openid_connect, setup: CLAVE_UNICA_SETUP_PROC, name: 'clave_unica', issuer: CustomAuthVerification::ClaveUnicaOmniauth.new.method(:issuer)
  provider :openid_connect, setup: CRIIPTO_SETUP_PROC, name: 'criipto', issuer: CustomAuthVerification::CriiptoOmniauth.new.method(:issuer)
  provider :openid_connect, setup: FRANCECONNECT_SETUP_PROC, name: 'franceconnect', issuer: CustomAuthVerification::FranceconnectOmniauth.new.method(:issuer)
  provider :openid_connect, setup: ID_AUSTRIA_SETUP_PROC, name: 'id_austria', issuer: CustomAuthVerification::IdAustriaOmniauth.new.method(:issuer)
  provider :openid_connect, setup: TWODAY_SETUP_PROC, name: 'twoday', issuer: CustomAuthVerification::TwodayOmniauth.new.method(:issuer)
  provider :openid_connect, setup: AUTH0_SETUP_PROC, name: 'auth0'
  provider :openid_connect, setup: HOPLR_SETUP_PROC, name: 'hoplr', issuer: CustomAuthVerification::HoplrOmniauth.new.method(:issuer)
end
