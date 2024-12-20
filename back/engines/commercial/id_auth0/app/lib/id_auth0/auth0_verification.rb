# frozen_string_literal: true

module IdAuth0
  module Auth0Verification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      'c6b24830-e17a-48a6-9f05-bd8fd3a4a0a6'
    end

    def name
      'auth0'
    end

    def config_parameters
      %i[client_id client_secret domain method_name_multiloc enabled_for_verified_actions]
    end

    def config_parameters_schema
      {
        method_name_multiloc: {
          '$ref': '#/definitions/multiloc_string',
          private: true
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
    end

    def exposed_config_parameters
      [
        :method_name_multiloc
      ]
    end

    def profile_to_uid(auth)
      auth['uid'] || auth.dig('extra', 'raw_info', 'user_id')
    end

    def locked_attributes
      []
    end

    def locked_custom_fields
      []
    end
  end
end
