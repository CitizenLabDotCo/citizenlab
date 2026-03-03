# frozen_string_literal: true

module IdFedera
  module FederaVerification
    include Verification::VerificationMethod

    def verification_method_type
      :omniauth
    end

    def id
      'b8e4d4a7-3f1c-4c5e-9a2b-6d8f0e1c3a5b'
    end

    def name
      'federa'
    end

    def config_parameters
      %i[environment spid_level private_key enabled_for_verified_actions]
    end

    def config_parameters_schema
      {
        environment: {
          type: 'string',
          title: 'Environment',
          description: 'Test environment or live production environment',
          enum: %w[test production],
          default: 'test',
          private: true
        },
        spid_level: {
          type: 'string',
          title: 'SPID Level',
          description: 'SPID authentication level (1, 2, or 3)',
          enum: %w[1 2 3],
          default: '1',
          private: true
        },
        private_key: {
          private: true,
          type: 'string',
          description: 'SP private key for signing SAML AuthnRequests. Should start with "-----BEGIN PRIVATE KEY-----".'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
    end

    def entitled?(_auth)
      true
    end

    def locked_attributes
      %i[first_name last_name]
    end

    def locked_custom_fields
      []
    end
  end
end
