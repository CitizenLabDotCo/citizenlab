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
        ui_method_name
        domain
        client_id
        client_secret
        enabled_for_verified_actions
        hide_from_profile
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI',
          default: 'ID-Porten'
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
      [
        :ui_method_name
      ]
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

    def enabled_for_verified_actions?
      config[:enabled_for_verified_actions] || false
    end

    def ui_method_name
      config[:ui_method_name] || name
    end
  end
end
