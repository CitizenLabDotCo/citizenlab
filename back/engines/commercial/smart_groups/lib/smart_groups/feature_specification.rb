module SmartGroups
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'smart_groups'
    end

    def self.feature_title
      'Smart Groups'
    end

    def self.feature_description
      'Users can automatically be assigned to a group based on certain criteria.'
    end
  end
end
