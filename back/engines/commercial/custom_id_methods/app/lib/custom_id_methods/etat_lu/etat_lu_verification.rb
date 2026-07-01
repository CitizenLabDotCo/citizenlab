# frozen_string_literal: true

module CustomIdMethods::EtatLu
  module EtatLuVerification

    def verification_method_type
      :omniauth
    end

    def id
      '723a3dca-d530-4934-9e05-5b5f86e4b657'
    end

    def name
      'etat_lu'
    end

    def config_parameters
      %i[
        ui_method_name
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
          description: 'Full URL to the OIDC issuer - eg https://idp.etat.lu'
        },
        client_id: {
          private: true,
          type: 'string'
        },
        client_secret: {
          private: true,
          type: 'string'
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

    def ui_method_name
      config[:ui_method_name].presence || name
    end
  end
end
