# frozen_string_literal: true

module IdKeycloak
  class Engine < ::Rails::Engine
    isolate_namespace IdKeycloak

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdKeycloak::FeatureSpecification)

      keycloak = KeycloakOmniauth.new
      IdMethod.add_method(keycloak)
      AuthenticationService.add_method('keycloak', keycloak)
    end
  end
end
