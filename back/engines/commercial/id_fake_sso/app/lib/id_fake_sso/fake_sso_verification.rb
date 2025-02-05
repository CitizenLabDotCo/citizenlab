# frozen_string_literal: true

module IdFakeSso
  module FakeSsoVerification
    include IdMethod::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      '8bb00a8d-26a5-4e00-866d-36e23986d441'
    end

    def name
      'fake_sso'
    end

    def config_parameters
      %i[enabled_for_verified_actions]
    end

    def config_parameters_schema
      {
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def other_attributes
      %i[email]
    end

    def locked_custom_fields
      %i[gender birthyear]
    end

    def other_custom_fields
      []
    end

    def ui_method_name
      'Fake SSO'
    end
  end
end
