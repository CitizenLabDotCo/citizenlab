# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdCriipto
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'criipto_login'
    end

    def self.feature_title
      'MitID (Criipto) Login'
    end

    def self.feature_description
      'Allow users to authenticate with a MitID (via Criipto) account.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
