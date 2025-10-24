# frozen_string_literal: true

module CustomIdMethods
  module Keycloak::KeycloakVerification
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

    def config_parameters_schema
      default_config_schema('ID-Porten').merge!(SCHEMA_DOMAIN)
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
      config[:ui_method_name] || name
    end
  end
end
