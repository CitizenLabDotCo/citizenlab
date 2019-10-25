module Verification
  module Methods
    # Fake method for testing purposes only
    class Bogus
      include VerificationMethod

      def veritication_method_type
        :manual_sync
      end

      def id
        "380cc6e1-6978-4a3d-8ad0-d72552b55d20"
      end

      def name
        "bogus"
      end

      def config_parameters
        []
      end
 
      def verification_parameters
        [:desired_error]
      end

      def verify_sync desired_error: nil
        case desired_error
        when "no_match"
          raise VerificationService::NoMatchError.new
        when "not_entitled"
          raise VerificationService::NotEntitledError.new
        when "taken"
          1
        else
          if desired_error.present?
            raise VerificationService::ParameterInvalidError.new("desired_error")
          else
            SecureRandom.alphanumeric(24)
          end
        end
      end
    end
  end
end
