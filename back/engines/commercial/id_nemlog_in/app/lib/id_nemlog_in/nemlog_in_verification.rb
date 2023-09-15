# frozen_string_literal: true

module IdNemlogIn
  module NemlogInVerification
    include Verification::VerificationMethod

    MINIMUM_AGE_REQUIREMENTS = { 'kobenhavntaler.kk.dk' => 15 }.freeze

    def verification_method_type
      :omniauth
    end

    def entitled?(auth)
      host = AppConfiguration.instance.host
      return true unless MINIMUM_AGE_REQUIREMENTS.key?(host)

      age_requirement = MINIMUM_AGE_REQUIREMENTS[host]
      age = auth.extra.raw_info['https://data.gov.dk/model/core/eid/age'].to_i
      raise Verification::VerificationService::NotEntitledError, <<~MSG.strip if age < age_requirement
        under_#{age_requirement}_years_of_age
      MSG

      true
    end

    def id
      'e7378672-add2-4eb1-a73b-77a805797eac'
    end

    def name
      'nemlog_in'
    end

    def config_parameters
      %i[
        environment
        issuer
        private_key
      ]
    end

    def config_parameters_schema
      {
        environment: {
          private: true,
          type: 'string',
          description: 'What Nemlog-in environment to use.',
          enum: IdNemlogIn::NemlogInOmniauth::ENVIRONMENTS.keys
        },
        issuer: {
          private: true,
          type: 'string',
          description: '`entityID` from SP metadata file. Usually domain name with protocol.'
        },
        private_key: {
          private: true,
          type: 'string',
          description: 'Private key. Looks sth like `-----BEGIN PRIVATE KEY-----\nD_zoDdzvVNoCA...\nSHy4aX_pQ...==\n-----END PRIVATE KEY-----`. Public key is specified in the SP metadata file.'
        }
      }
    end
  end
end
