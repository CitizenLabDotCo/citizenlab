module IdBogus
  # Fake method for testing purposes only
  class BogusVerification
    include Verification::VerificationMethod

    def verification_method_type
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
        raise Verification::VerificationService::NoMatchError.new
      when "not_entitled"
        raise Verification::VerificationService::NotEntitledError.new
      when "taken"
        {
          uid: 1
        }
      else
        if desired_error.present?
          raise Verification::VerificationService::ParameterInvalidError.new("desired_error")
        else
          {
            uid: SecureRandom.alphanumeric(24),
            attributes: {
              last_name: 'BOGUS'
            },
            custom_field_values: {
              gender: 'female'
            }
          }
        end
      end
    end

    def locked_attributes
      [:last_name]
    end

    def locked_custom_fields
      [:gender]
    end
  end
end
