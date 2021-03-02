# frozen_string_literal: true

require 'citizen_lab/mixins/feature_specification'

module IdeaAssignment
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'idea_assignment'
    end

    def self.feature_title
      'Assign Ideas'
    end

    def self.feature_description
      'Ideas can be assigned to specific admin and project managers to respond to.'
    end
  end
end

AppConfiguration::Settings.add_feature(IdeaAssignment::FeatureSpecification)
