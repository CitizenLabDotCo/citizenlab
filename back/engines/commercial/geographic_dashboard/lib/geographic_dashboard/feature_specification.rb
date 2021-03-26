# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module GeographicDashboard
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'geographic_dashboard'
    end

    def self.feature_title
      'Geographic Dashboard'
    end

    def self.feature_description
      'Shows a map with automatically detected idea locations. PoC, not yet stable.'
    end
  end
end
