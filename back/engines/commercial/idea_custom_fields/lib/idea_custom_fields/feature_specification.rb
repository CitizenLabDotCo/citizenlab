module IdeaCustomFields
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'idea_custom_fields'
    end

    def self.feature_title
      'Custom Idea Fields'
    end

    def self.feature_description
      'Admin and project managers can specify which idea form fields to enable/disable or make mandatory.'
    end
  end
end
