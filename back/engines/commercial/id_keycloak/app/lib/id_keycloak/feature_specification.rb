# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdKeycloak
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'keycloak_login'
    end

    def self.feature_title
      'Keycloak (ID-Porten) Login'
    end

    def self.feature_description
      'Allow users to authenticate with a Norwegian ID-Porten (via Keycloak) account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
