# frozen_string_literal: true

module IdClaveUnica
  module ClaveUnicaVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      'f06ddcf6-38c5-495d-a319-0863a7f3e073'
    end

    def name
      'clave_unica'
    end

    def config_parameters
      %i[client_id client_secret enabled_for_verified_actions]
    end

    def config_parameters_schema
      {
        client_id: {
          private: true,
          type: 'string',
          description: 'Client ID.'
        },
        client_secret: {
          private: true,
          type: 'string',
          description: 'Client secret.'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
    end

    def profile_to_uid(auth)
      auth['uid'] || auth.dig('extra', 'raw_info', 'RolUnico', 'numero')
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end
  end
end
