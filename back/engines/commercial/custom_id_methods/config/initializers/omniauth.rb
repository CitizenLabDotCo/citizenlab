# frozen_string_literal: true

# OmniAuth middleware for every custom SSO / verification method. Each provider
# keeps its own setup proc and OmniAuth::Builder block (mirroring the previously
# separate id_* engines) so the registration behaviour is unchanged.

FACEBOOK_SETUP_PROC = lambda do |env|
  CustomIdMethods::Facebook::FacebookOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, setup: FACEBOOK_SETUP_PROC
end

GOOGLE_SETUP_PROC = lambda do |env|
  CustomIdMethods::Google::GoogleOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, setup: GOOGLE_SETUP_PROC, name: 'google'
end

OmniAuth.config.add_camelization 'azure_activedirectory', 'AzureActiveDirectory'
AZURE_AD_SETUP_PROC = lambda do |env|
  CustomIdMethods::AzureActiveDirectory::AzureActiveDirectoryOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :azure_activedirectory, setup: AZURE_AD_SETUP_PROC
end

AZURE_AD_B2C_SETUP_PROC = lambda do |env|
  CustomIdMethods::AzureActiveDirectoryB2c::AzureActiveDirectoryB2cOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: AZURE_AD_B2C_SETUP_PROC, name: 'azureactivedirectory_b2c'
end

ACM_SETUP_PROC = lambda do |env|
  CustomIdMethods::Acm::AcmOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: ACM_SETUP_PROC, name: 'acm', issuer: CustomIdMethods::Acm::AcmOmniauth.new.method(:issuer)
end

AUTH0_SETUP_PROC = lambda do |env|
  CustomIdMethods::Auth0::Auth0Omniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :auth0, setup: AUTH0_SETUP_PROC, name: 'auth0'
end

BOSA_FAS_SETUP_PROC = lambda do |env|
  CustomIdMethods::BosaFas::BosaFasOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: BOSA_FAS_SETUP_PROC, name: 'bosa_fas'
end

CLAVE_UNICA_SETUP_PROC = lambda do |env|
  CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: CLAVE_UNICA_SETUP_PROC, name: 'clave_unica', issuer: CustomIdMethods::ClaveUnica::ClaveUnicaOmniauth.new.method(:issuer)
end

CRIIPTO_SETUP_PROC = lambda do |env|
  CustomIdMethods::Criipto::CriiptoOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: CRIIPTO_SETUP_PROC, name: 'criipto', issuer: CustomIdMethods::Criipto::CriiptoOmniauth.new.method(:issuer)
end

FAKE_SSO_SETUP_PROC = lambda do |env|
  CustomIdMethods::FakeSso::FakeSsoOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: FAKE_SSO_SETUP_PROC, name: 'fake_sso', issuer: CustomIdMethods::FakeSso::FakeSsoOmniauth.new.method(:issuer)
end

FEDERA_SETUP_PROC = lambda do |env|
  CustomIdMethods::Federa::FederaOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: FEDERA_SETUP_PROC, name: 'federa'
end

FRANCECONNECT_SETUP_PROC = lambda do |env|
  CustomIdMethods::Franceconnect::FranceconnectOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: FRANCECONNECT_SETUP_PROC, name: 'franceconnect', issuer: CustomIdMethods::Franceconnect::FranceconnectOmniauth.new.method(:issuer)
end

HOPLR_SETUP_PROC = lambda do |env|
  CustomIdMethods::Hoplr::HoplrOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: HOPLR_SETUP_PROC, name: 'hoplr', issuer: CustomIdMethods::Hoplr::HoplrOmniauth.new.method(:issuer)
end

ID_AUSTRIA_SETUP_PROC = lambda do |env|
  CustomIdMethods::IdAustria::IdAustriaOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: ID_AUSTRIA_SETUP_PROC, name: 'id_austria', issuer: CustomIdMethods::IdAustria::IdAustriaOmniauth.new.method(:issuer)
end

KEYCLOAK_SETUP_PROC = lambda do |env|
  CustomIdMethods::Keycloak::KeycloakOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: KEYCLOAK_SETUP_PROC, name: 'keycloak', issuer: CustomIdMethods::Keycloak::KeycloakOmniauth.new.method(:issuer)
end

NEMLOG_IN_SAML_SETUP_PROC = lambda do |env|
  CustomIdMethods::NemlogIn::NemlogInOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: NEMLOG_IN_SAML_SETUP_PROC, name: 'nemlog_in'
end

TWODAY_SETUP_PROC = lambda do |env|
  CustomIdMethods::Twoday::TwodayOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: TWODAY_SETUP_PROC, name: 'twoday', issuer: CustomIdMethods::Twoday::TwodayOmniauth.new.method(:issuer)
end

# Vienna Standardportal — employees SAML SSO
VIENNA_SAML_EMPLOYEE_SETUP_PROC = lambda do |env|
  CustomIdMethods::ViennaSaml::EmployeeSamlOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: VIENNA_SAML_EMPLOYEE_SETUP_PROC, name: 'vienna_employee'
end

# Vienna Standardportal — citizens SAML SSO
VIENNA_SAML_CITIZEN_SAML_SETUP_PROC = lambda do |env|
  CustomIdMethods::ViennaSaml::CitizenSamlOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :saml, setup: VIENNA_SAML_CITIZEN_SAML_SETUP_PROC, name: 'vienna_citizen'
end
