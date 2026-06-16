# frozen_string_literal: true

module CustomIdMethods::Franceconnect
  module FranceconnectVerification
    def verification_method_type
      :omniauth
    end

    def id
      '68fecc38-9449-4087-9475-fc31e05a0936'
    end

    def config_parameters
      %i[environment identifier secret version scope enabled_for_verified_actions]
    end

    def config_parameters_schema
      {
        environment: {
          private: true,
          type: 'string',
          title: 'Environment',
          description: 'Live on the production FranceConnect environment or still testing on their integration environment?',
          enum: %w[production integration],
          default: 'production'
        },
        identifier: {
          private: true,
          type: 'string',
          title: 'Identifier'
        },
        secret: {
          private: true,
          type: 'string',
          title: 'Secret Key'
        },
        version: {
          private: true,
          type: 'string',
          title: 'Version of FranceConnect API',
          enum: %w[v1 v2],
          default: 'v1'
        },
        scope: {
          private: true,
          type: 'array',
          title: 'Scope',
          description: 'The data that will be requested from FranceConnect. See https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service#identite-pivot. Fields that can be saved: email, given_name, family_name, birthdate, gender.',
          items: {
            type: 'string',
            enum: %w[email given_name family_name birthdate gender idp_birthdate birthplace birthcountry preferred_username profile birth identite_pivot]
          },
          uniqueItems: true,
          default: %w[email given_name family_name]
        },
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
