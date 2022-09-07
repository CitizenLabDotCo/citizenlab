# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module Analytics
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'analytics'
    end

    def self.feature_title
      'Analytics'
    end

    def self.feature_description
      'Dedicated endpoints for dashboards and analytics.'
    end

    def self.allowed_by_default
      false
    end

    def self.enabled_by_default
      false
    end
  end
end
