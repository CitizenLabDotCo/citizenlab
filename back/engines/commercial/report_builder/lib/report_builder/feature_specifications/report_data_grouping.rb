# frozen_string_literal: true

module ReportBuilder
  module FeatureSpecifications
    module ReportDataGrouping
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'report_data_grouping'
      end

      def self.feature_title
        'Group survey responses in reports'
      end

      def self.feature_description
        <<~DESC.squish
          Group survey responses by any user field (gender, location, age, etc) or other survey questions.
        DESC
      end

      def self.allowed_by_default
        false
      end

      def self.enabled_by_default
        false
      end

      def self.dependencies
        %w[report_builder]
      end
    end
  end
end
