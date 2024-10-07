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
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          description: 'The name this verification method will have in the UI',
          default: 'ID-Porten'
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

    def locked_custom_fields
      [
        config[:birthday_custom_field_key].presence,
        config[:birthyear_custom_field_key].presence
      ].compact
    end

    def profile_to_uid(auth)
      auth['uid']
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
