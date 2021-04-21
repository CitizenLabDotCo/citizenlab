module UserConfirmation
  module FeatureSpecification
    extend CitizenLab::Mixins::FeatureSpecification

    def self.feature_name
      'user_confirmation'
    end

    def self.feature_title
      'User Account Confirmation'
    end

    def self.feature_description
      'Add email confirmation functionality to users.'
    end
  end
end
