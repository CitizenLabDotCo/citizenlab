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
        provider
        issuer
        client_id
        client_secret
        enabled_for_verified_actions
        hide_from_profile
      ]
    end

    def config_parameters_schema
      {
        provider: {
          type: 'string',
          title: 'Identity Provider',
          enum: %w[idporten rheinbahn]
        },
        issuer: {
          private: true,
          type: 'string',
          description: 'Full URL to the issuer of the keycloak instance - eg https://keycloak.com/auth/realms/realm-name'
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
        :provider
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

    def ui_method_name
      case config[:provider]
      when 'idporten'
        'ID-Porten'
      when 'rheinbahn'
        'Rheinbahn'
      else
        name
      end
    end

    # Verification is only enabled for ID-Porten not Rheinbahn
    def enabled?
      config[:provider] == 'idporten'
    end
  end
end
