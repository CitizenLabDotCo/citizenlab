# frozen_string_literal: true

module ReportBuilder
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'report_builder'
    end

    def self.feature_title
      'Report Builder'
    end

    def self.feature_description
      <<~DESC.squish
        Create customizable reports.
        This feature is experimental and should not be enabled yet.
      DESC
    end
  end
end
