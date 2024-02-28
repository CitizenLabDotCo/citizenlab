# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module CustomMaps
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'custom_maps'
    end

    def self.feature_title
      'GeoJSON Map Layers'
    end

    def self.feature_description
      'Adds the ability to use GeoJSON layers on maps.'
    end
  end
end
