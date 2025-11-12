# frozen_string_literal: true

module IdIdAustria
  module IdAustriaVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      '91068f8a-c4a5-4fc8-ab3e-ca2eb74f9c3c'
    end

    def name
      'id_austria'
    end

    def ui_method_name
      config[:ui_method_name].presence || name
    end

    def config_parameters
      %i[
        client_id
        client_secret
        ui_method_name
        enabled_for_verified_actions
        hide_from_profile
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI'
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

    def entitled?(_auth)
      true
    end

    def exposed_config_parameters
      [:ui_method_name]
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
