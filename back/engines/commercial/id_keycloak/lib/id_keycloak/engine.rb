# frozen_string_literal: true

module IdKeycloak
  class Engine < ::Rails::Engine
    isolate_namespace IdKeycloak

    config.to_prepare do
      AppConfiguration::Settings.add_feature(IdKeycloak::FeatureSpecification)
      IdMethod.add_method('keycloak', KeycloakOmniauth.new)
    end
  end
end
