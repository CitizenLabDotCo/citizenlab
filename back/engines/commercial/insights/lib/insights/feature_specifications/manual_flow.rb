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
        'Manual insights flow'
      end

      def self.feature_description
        <<~DESC
          [WARNING: experimental - do not enable this feature on production platforms] 
          Manual reporting flow: from inputs to insights.
        DESC
      end

      def self.allowed_by_default
        false
      end

      def self.enabled_by_default
        false
      end
    end
  end
end
