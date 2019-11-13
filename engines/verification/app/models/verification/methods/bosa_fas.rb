module Verification
  module Methods
    module BosaFAS
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
        [:environment, :identifier, :secret]
      end

      def locked_user_attributes
        [:first_name, :last_name]
      end

      def locked_user_custom_fields
        []
      end

      def entitled? auth
        true
      end

      def profile_to_uid auth
        auth['uid'] || auth.dig('extra','raw_info','egovNRN')
      end

    end
  end
end
