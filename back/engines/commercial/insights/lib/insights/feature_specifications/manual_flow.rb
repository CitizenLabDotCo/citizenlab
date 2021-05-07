# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module Insights
  module FeatureSpecifications
    module ManualFlow
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'insights_manual_flow'
      end

      def self.feature_title
        'Manual reporting flow: from inputs to insights'
      end

      def self.feature_description
        'Manual reporting flow: from inputs to insights'
      end
    end
  end
end
