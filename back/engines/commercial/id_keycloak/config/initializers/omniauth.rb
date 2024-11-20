# frozen_string_literal: true

KEYCLOAK_SETUP_PROC = lambda do |env|
  IdKeycloak::KeycloakOmniauth.new.omniauth_setup(AppConfiguration.instance, env)
end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :openid_connect, setup: KEYCLOAK_SETUP_PROC, name: 'keycloak', issuer: IdKeycloak::KeycloakOmniauth.new.method(:issuer)
end
