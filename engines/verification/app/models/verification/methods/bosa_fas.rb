module Verification
  module Methods
    # Fake method for testing purposes only
    class BosaFas
      include VerificationMethod

      def veritication_method_type
        :omniauth
      end

      def id
        "6a66cafb-08a8-451f-8c0b-f349cdfdaaee"
      end

      def name
        "bosa_fas"
      end

      def config_parameters
        []
      end

      def locked_user_attributes
        [:first_name, :last_name]
      end

      def locked_user_custom_fields
        []
      end

      def authentication_method_claz
        SingleSignOnService::BosaFAS
      end

    end
  end
end
