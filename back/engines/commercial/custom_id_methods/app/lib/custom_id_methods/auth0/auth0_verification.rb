# frozen_string_literal: true

module CustomIdMethods::Auth0
  module Auth0Verification
    def verification_method_type
      :omniauth
    end

    def id
      'c6b24830-e17a-48a6-9f05-bd8fd3a4a0a6'
    end

    def config_parameters_schema
      {
        client_id: {
          private: true,
          type: 'string'
        },
        client_secret: {
          private: true,
          type: 'string'
        },
        domain: {
          private: true,
          type: 'string'
        },
        method_name_multiloc: {
          '$ref': '#/definitions/multiloc_string'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
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
