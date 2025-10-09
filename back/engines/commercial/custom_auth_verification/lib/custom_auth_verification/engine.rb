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
    end
  end
end
