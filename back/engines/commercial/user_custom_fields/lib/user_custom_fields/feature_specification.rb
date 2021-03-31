module UserCustomFields
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'user_custom_fields'
    end

    def self.feature_title
      'Custom Registration Fields'
    end

    def self.feature_description
      'Allow admins to define custom registration fields.'
    end
  end
end