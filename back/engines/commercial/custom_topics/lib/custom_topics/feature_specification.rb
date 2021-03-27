module CustomTopics
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'custom_topics'
    end

    def self.feature_title
      'Custom Topics'
    end

    def self.feature_description
      'Admin and project managers can customize idea topics.'
    end
  end
end