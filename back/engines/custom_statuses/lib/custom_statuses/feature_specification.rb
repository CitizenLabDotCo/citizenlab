module CustomStatuses
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'custom_idea_statuses'
    end

    def self.feature_title
      'Custom Idea Statuses'
    end

    def self.feature_description
      'Allows admin to define custom idea statuses.'
    end
  end
end
