# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module Insights
  module FeatureSpecifications
    module NlpFlow
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'insights_nlp_flow'
      end

      def self.feature_title
        'NLP insights flow'
      end

      def self.feature_description
        <<~DESC
          [WARNING: experimental - do not enable this feature on production platforms] 
          NLP-assisted reporting flow: from inputs to insights.
        DESC
      end

      def self.dependencies
        ['insights_manual_flow']
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
