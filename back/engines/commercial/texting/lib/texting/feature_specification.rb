# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module Texting
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'texting'
    end

    def self.feature_title
      'Texting'
    end

    def self.feature_description
      'Texting users via SMS.'
    end
  end
end
