# frozen_string_literal: true

module ContentBuilder
  module FeatureSpecifications
    module ProjectDescriptionBuilder
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'project_description_builder'
      end

      def self.feature_title
        'Project-description builder'
      end

      def self.feature_description
        'Activate the rich editor that allows customization of project descriptions.'
      end
    end
  end
end
