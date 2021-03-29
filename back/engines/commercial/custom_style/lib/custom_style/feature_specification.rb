# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module CustomStyle
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'custom_style'
    end

    def self.feature_title
      'Custom style'
    end

    def self.feature_description
      'Admins can specify additional styling options.'
    end
  end
end
