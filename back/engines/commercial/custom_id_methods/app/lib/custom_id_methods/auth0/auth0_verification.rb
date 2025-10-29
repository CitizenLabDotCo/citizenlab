# frozen_string_literal: true

module CustomIdMethods
  module Auth0::Auth0Verification
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

    def config_parameters_schema
      schema = {
        method_name_multiloc: {
          '$ref': '#/definitions/multiloc_string',
          private: true
        }
      }
      schema.merge!(SCHEMA_CLIENT_SECRET)
      schema.merge!(SCHEMA_CLIENT_ID)
      schema.merge!(SCHEMA_DOMAIN)
      schema.merge!(SCHEMA_ENABLED_FOR_VERIFIED_ACTIONS)
      schema.merge!(SCHEMA_HIDE_FROM_PROFILE)
      schema
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
