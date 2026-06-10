# frozen_string_literal: true

module CustomIdMethods::Rheinbahn
  module RheinbahnVerification
    def verification_method_type
      :omniauth
    end

    def id
      'c7e0a4d2-9f1b-4a36-8e52-3b0d6f8a1c94'
    end

    def config_parameters
      %i[
        issuer
        client_id
        client_secret
        enabled_for_verified_actions
        hide_from_profile
      ]
    end

    def config_parameters_schema
      {
        issuer: {
          private: true,
          type: 'string',
          description: 'Full URL to the issuer of the Rheinbahn keycloak instance - eg https://keycloak.com/auth/realms/realm-name'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        },
        hide_from_profile: {
          private: true,
          type: 'boolean',
          description: 'Should verification be hidden in the user profile and under the username?'
        }
      }
    end

    def exposed_config_parameters
      []
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def other_attributes
      %i[email]
    end

    def profile_to_uid(auth)
      auth['uid']
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end

    def ui_method_name
      'Rheinbahn'
    end
  end
end
