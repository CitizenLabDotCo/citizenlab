# frozen_string_literal: true

FAKE_SSO_SETUP_PROC = ->(env) { CustomIdMethods::FakeSso::FakeSsoOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
KEYCLOAK_SETUP_PROC = ->(env) { CustomIdMethods::Keycloak::KeycloakOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
BOSA_FAS_SETUP_PROC = ->(env) { CustomIdMethods::BosaFas::BosaFasOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
CLAVE_UNICA_SETUP_PROC = ->(env) { CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
CRIIPTO_SETUP_PROC = ->(env) { CustomIdMethods::Criipto::CriiptoOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
FRANCECONNECT_SETUP_PROC = ->(env) { CustomIdMethods::Franceconnect::FranceconnectOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
ID_AUSTRIA_SETUP_PROC = ->(env) { CustomIdMethods::IdAustria::IdAustriaOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
TWODAY_SETUP_PROC = ->(env) { CustomIdMethods::Twoday::TwodayOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
AUTH0_SETUP_PROC = ->(env) { CustomIdMethods::Auth0::Auth0Omniauth.new.omniauth_setup(AppConfiguration.instance, env) }
HOPLR_SETUP_PROC = ->(env) { CustomIdMethods::Hoplr::HoplrOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }
NEMLOG_IN_SAML_SETUP_PROC = ->(env) { CustomIdMethods::NemlogIn::NemlogInOmniauth.new.omniauth_setup(AppConfiguration.instance, env) }

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: FAKE_SSO_SETUP_PROC, name: 'fake_sso', issuer: CustomIdMethods::FakeSso::FakeSsoOmniauth.new.method(:issuer)
  provider :openid_connect, setup: KEYCLOAK_SETUP_PROC, name: 'keycloak', issuer: CustomIdMethods::Keycloak::KeycloakOmniauth.new.method(:issuer)
  provider :openid_connect, setup: BOSA_FAS_SETUP_PROC, name: 'bosa_fas'
  provider :openid_connect, setup: CLAVE_UNICA_SETUP_PROC, name: 'clave_unica', issuer: CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth.new.method(:issuer)
  provider :openid_connect, setup: CRIIPTO_SETUP_PROC, name: 'criipto', issuer: CustomIdMethods::Criipto::CriiptoOmniauth.new.method(:issuer)
  provider :openid_connect, setup: FRANCECONNECT_SETUP_PROC, name: 'franceconnect', issuer: CustomIdMethods::Franceconnect::FranceconnectOmniauth.new.method(:issuer)
  provider :openid_connect, setup: ID_AUSTRIA_SETUP_PROC, name: 'id_austria', issuer: CustomIdMethods::IdAustria::IdAustriaOmniauth.new.method(:issuer)
  provider :openid_connect, setup: TWODAY_SETUP_PROC, name: 'twoday', issuer: CustomIdMethods::Twoday::TwodayOmniauth.new.method(:issuer)
  provider :openid_connect, setup: AUTH0_SETUP_PROC, name: 'auth0'
  provider :openid_connect, setup: HOPLR_SETUP_PROC, name: 'hoplr', issuer: CustomIdMethods::Hoplr::HoplrOmniauth.new.method(:issuer)
  provider :saml, setup: NEMLOG_IN_SAML_SETUP_PROC, name: 'nemlog_in'
end
