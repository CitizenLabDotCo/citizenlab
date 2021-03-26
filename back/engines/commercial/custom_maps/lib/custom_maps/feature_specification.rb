# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module CustomMaps
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'custom_maps'
    end

    def self.feature_title
      'Custom Map Configuration'
    end

    def self.feature_description
      'Adds an extra tab to the project settings where admins can customize the project map.'
    end
  end
end
