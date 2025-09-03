# frozen_string_literal: true

module IdFranceconnect
  module FranceconnectVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      '68fecc38-9449-4087-9475-fc31e05a0936'
    end

    def name
      'franceconnect'
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

    def locked_custom_fields
      []
    end
  end
end
