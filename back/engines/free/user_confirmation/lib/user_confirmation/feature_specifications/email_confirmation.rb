module UserConfirmation
  module FeatureSpecifications
    module EmailVerification
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'email_verification'
      end

      def self.feature_title
        'Email Verification'
      end

      def self.feature_description
        'Add email verification functionality to users.'
      end
    end
  end
end
