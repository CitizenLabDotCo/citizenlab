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

    def config_parameters
      %i[
        client_id
        client_secret
        ui_method_name
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI'
        },
        environment: {
          private: true,
          type: 'string',
          enum: %w[test production],
          description: 'The environment to use for the ID Austria login'
        }
      }
    end

    def entitled?(_auth)
      true
    end

    def exposed_config_parameters
      [:ui_method_name]
    end

    # def profile_to_uid(auth)
    #   TODO: JS - Check if the uid we get back is different frin just 'uid' (in base)
    # end

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
