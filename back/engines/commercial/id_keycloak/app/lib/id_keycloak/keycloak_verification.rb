# frozen_string_literal: true

module IdKeycloak
  module KeycloakVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      'd6938fe6-4bee-4490-b80c-b14dafb5da1b'
    end

    def name
      'keycloak'
    end

    def config_parameters
      %i[
        birthday_custom_field_key
        birthyear_custom_field_key
        municipality_code_custom_field_key
        domain
        client_id
        client_secret
        minimum_age
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI',
          default: 'ID-Porten'
        },
        birthday_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the custom field where the birthdate should be stored. Leave empty to not store the birthday. If it\'s set, the field will be locked for verified users.'
        },
        birthyear_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the custom field where the birthyear should be stored (`birthyear` by default). Leave empty to not store the birthyear. If it\'s set, the field will be locked for verified users.'
        },
        municipality_code_custom_field_key: {
          private: true,
          type: 'string',
          description: 'Only for MitID: The `key` attribute of the custom field where the municipality_key should be stored. Leave empty to not store the municipality_key. We don\'t lock this field, assuming it is a hidden field.'
        },
        minimum_age: {
          private: true,
          type: 'integer',
          description: 'Minimum age required to verify (in years). No value means no age minimum.'
        }
      }
    end

    # copied from back/engines/commercial/id_nemlog_in/app/lib/id_nemlog_in/nemlog_in_verification.rb
    def entitled?(auth)
      minimum_age = config[:minimum_age]
      return true if minimum_age.blank?

      age = auth.extra.raw_info.age.to_i
      raise Verification::VerificationService::NotEntitledError, 'under_minimum_age' if age < minimum_age

      true
    end

    def exposed_config_parameters
      [
        :ui_method_name
      ]
    end

    def profile_to_uid(auth)
      auth.extra.raw_info.to_h.symbolize_keys
    end

    def locked_attributes
      []
    end

    def locked_custom_fields
      [
        config[:birthday_custom_field_key].presence,
        config[:birthyear_custom_field_key].presence
      ].compact
    end

    def updateable_user_attrs
      super + %i[custom_field_values birthyear]
    end
  end
end
