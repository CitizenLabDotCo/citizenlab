# frozen_string_literal: true

module IdNemlogIn
  module NemlogInVerification
    include Verification::VerificationMethod

    HOSTS_WITH_AGE_MINIMUM_15 = %w[kobenhavntaler.kk.dk]

    def verification_method_type
      :omniauth
    end

    def entitled?(auth)
      issuer = AppConfiguration.instance.settings['verification']['verification_methods'][0]['issuer']
      return true unless HOSTS_WITH_AGE_MINIMUM_15.any? { |host| issuer.include?(host) }

      age = auth.extra.raw_info['https://data.gov.dk/model/core/eid/age'].to_i
      raise Verification::VerificationService::NotEntitledError, 'under_15_years_of_age' if age < 15

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
