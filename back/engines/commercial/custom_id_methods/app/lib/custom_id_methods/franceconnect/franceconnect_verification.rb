# frozen_string_literal: true

module CustomIdMethods
  module Franceconnect::FranceconnectVerification
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

    def config_parameters_schema
      schema = default_config_schema
      schema.merge! SCHEMA_ENVIRONMENT
      schema[:version] = {
        title: 'Version of FranceConnect API',
        type: 'string',
        enum: %w[v1 v2],
        default: 'v1',
        private: true
      }
      schema[:scope] = {
        title: 'Scope',
        description: 'The data that will be requested from FranceConnect. See https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#identite-pivot. Fields that can be saved: email, given_name, family_name, birthdate, gender.',
        type: 'array',
        items: {
          type: 'string',
          enum: %w[email given_name family_name birthdate gender idp_birthdate birthplace birthcountry preferred_username profile birth identite_pivot]
        },
        uniqueItems: true,
        default: %w[email given_name family_name],
        private: true
      }
      schema
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end
  end
end
