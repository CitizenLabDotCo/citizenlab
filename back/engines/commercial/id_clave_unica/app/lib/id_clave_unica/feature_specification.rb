# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdClaveUnica
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'clave_unica_login'
    end

    def self.feature_title
      'ClaveUnica Login'
    end

    def self.feature_description
      'Allow users to authenticate and verify with a ClaveUnica account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end

    def self.pricing
      true
    end
  end
end
