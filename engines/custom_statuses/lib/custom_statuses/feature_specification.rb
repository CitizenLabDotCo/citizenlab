module CustomStatuses
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'custom_statuses'
    end

    def self.feature_title
      'Custom Statuses'
    end

    def self.feature_description
      'Allows customization of the idea and initiative statuses.'
    end
  end
end