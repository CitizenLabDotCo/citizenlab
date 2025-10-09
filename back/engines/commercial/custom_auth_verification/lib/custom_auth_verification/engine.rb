# frozen_string_literal: true

module CustomAuthVerification
  class Engine < ::Rails::Engine
    isolate_namespace CustomAuthVerification

    config.to_prepare do
      AppConfiguration::Settings.add_feature(CustomAuthVerification::FeatureSpecification)

      # Fake SSO for testing purposes
      fake_sso_method = FakeSsoOmniauth.new
      AuthenticationService.add_method('fake_sso', fake_sso_method)
      Verification.add_method(fake_sso_method)

      # Keycloak integration (Oslo IDPorten)
      keycloak = KeycloakOmniauth.new
      Verification.add_method(keycloak)
      AuthenticationService.add_method('keycloak', keycloak)

      # Auth0 integration
      # auth0 = Auth0Omniauth.new
      # Verification.add_method(auth0)
      # AuthenticationService.add_method('auth0', auth0)

      # Bogus verification method for testing purposes
      Verification.add_method(BogusVerification.new)

      # BOSA FAS integration - Authentication and verification using the Belgian eID and itsme system
      Verification.add_method(BosaFasOmniauth.new)
    end
  end
end
