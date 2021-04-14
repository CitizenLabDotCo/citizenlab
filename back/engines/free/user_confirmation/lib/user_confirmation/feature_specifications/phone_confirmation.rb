module UserConfirmation
  module FeatureSpecifications
    module PhoneVerification
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'phone_verification'
      end

      def self.feature_title
        'Phone Verification'
      end

      def self.feature_description
        'Add phone verification functionality to users.'
      end
    end
  end
end
