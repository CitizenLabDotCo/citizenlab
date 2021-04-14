module UserConfirmation
  module FeatureSpecifications
    module PhoneConfirmation
      extend CitizenLab::Mixins::FeatureSpecification

      def self.feature_name
        'phone_confirmation'
      end

      def self.feature_title
        'Phone Confirmation'
      end

      def self.feature_description
        'Add phone confirmation functionality to users.'
      end
    end
  end
end
