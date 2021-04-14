module UserConfirmation
  module FeatureSpecifications
    module EmailConfirmation
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'email_confirmation'
      end

      def self.feature_title
        'Email Confirmation'
      end

      def self.feature_description
        'Add email confirmation functionality to users.'
      end
    end
  end
end
