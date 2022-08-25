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
      'New analytics coming from a data warehouse.'
    end
  end
end
