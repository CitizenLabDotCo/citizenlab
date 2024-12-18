# frozen_string_literal: true

module IdNemlogIn
  module NemlogInVerification
    include IdMethod::VerificationMethod

    def verification_method_type
      :omniauth
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
        minimum_age
        birthday_custom_field_key
        birthyear_custom_field_key
        enabled_for_verified_actions
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
        },
        minimum_age: {
          private: true,
          type: 'integer',
          description: 'Minimum age required to verify (in years). No value means no age minimum.'
        },
        birthday_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the custom field where the birthdate should be stored. Leave empty to not store the birthday. If it\'s set, the field will be locked for verified users.'
        },
        birthyear_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the custom field where the birthyear should be stored (`birthyear` by default). Leave empty to not store the birthyear. If it\'s set, the field will be locked for verified users.'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
    end

    def entitled?(auth)
      minimum_age = config[:minimum_age]
      return true if minimum_age.blank?

      age = auth.extra.raw_info['https://data.gov.dk/model/core/eid/age'].to_i
      raise Verification::VerificationService::NotEntitledError, 'under_minimum_age' if age < minimum_age

      true
    end

    def check_entitled_on_sso?
      true
    end

    def ui_method_name
      'NemLog-in'
    end
  end
end
