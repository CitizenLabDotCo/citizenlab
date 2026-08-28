# frozen_string_literal: true

module CustomIdMethods::Acm
  module AcmVerification # rubocop:disable Metrics/ModuleLength
    include RrnCheck

    def verification_method_type
      :omniauth
    end

    def id
      'e8f3a1b2-9c4d-4e5f-a6b7-c8d9e0f1a2b3'
    end

    def config_parameters
      %i[
        ui_method_name
        domain
        client_id
        client_secret
        enabled_for_verified_actions
        hide_from_profile
        rrn_result_custom_field_key
        rrn_provider
        rrn_api_key
        rrn_environment
        magda_environment
        magda_uri
        magda_hoedanigheidscode
        magda_certificate
        magda_private_key
        magda_postal_codes
        magda_minimum_age
      ]
    end

    def config_parameters_schema
      {
        ui_method_name: {
          type: 'string',
          title: 'The name this verification method will have in the UI',
          default: 'ACM'
        },
        rrn_result_custom_field_key: {
          private: true,
          type: 'string',
          description: 'The `key` attribute of the select custom field where the result of the RRN check should be stored (options: valid, lives_outside, under_minimum_age, no_match, service_error). Leave empty to not check the RRN. If it\'s set, the field will be locked for verified users.'
        },
        rrn_provider: {
          private: true,
          type: 'string',
          enum: RrnCheck::RRN_PROVIDERS,
          default: 'wijk_budget_api',
          description: 'Which service checks the RRN: the Oostende WijkBudget API (rrn_api_key + rrn_environment) or MAGDA GeefPersoon (magda_* parameters).'
        },
        rrn_environment: {
          type: 'string',
          enum: %w[dv qa production],
          private: true,
          description: 'WijkBudget API environment.'
        },
        rrn_api_key: {
          type: 'string',
          private: true,
          description: 'WijkBudget API key.'
        },
        magda_environment: {
          private: true,
          type: 'string',
          enum: %w[production tni],
          default: 'production',
          description: 'MAGDA environment: production, or tni for the test environment. The endpoints are fixed per environment (tni uses the -aip hosts).'
        },
        magda_uri: {
          private: true,
          type: 'string',
          description: 'The "URI (identifier)" from the MAGDA aansluitingsmail, e.g. bornem.be/govocal/ipdc77332. Not the certificate CN; T&I URIs end in -aip.'
        },
        magda_hoedanigheidscode: {
          private: true,
          type: 'string',
          description: 'The "Hoedanigheidscode" from the MAGDA aansluitingsmail, e.g. ipdc77332.'
        },
        magda_certificate: {
          private: true,
          type: 'string',
          description: 'DCBaaS application certificate (PEM) for this environment. Looks like `-----BEGIN CERTIFICATE-----\nMIIF...\n-----END CERTIFICATE-----`'
        },
        magda_private_key: {
          private: true,
          type: 'string',
          description: 'Private key (PEM) of the certificate. Looks like `-----BEGIN RSA PRIVATE KEY-----\nMIIJ...\n-----END RSA PRIVATE KEY-----`'
        },
        magda_postal_codes: {
          private: true,
          type: 'array',
          items: { type: 'string' },
          uniqueItems: true,
          description: 'Postal codes whose residents get the result `valid`, e.g. ["2880"]. Empty means no postcode restriction.'
        },
        magda_minimum_age: {
          private: true,
          type: 'integer',
          description: 'Minimum age (in years) for the result `valid`, e.g. 12. Leave empty for no age restriction.'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        },
        hide_from_profile: {
          private: true,
          type: 'boolean',
          description: 'Should verification be hidden in the user profile and under the username?'
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
      [config&.dig(:rrn_result_custom_field_key)].compact_blank
    end

    def profile_to_uid(auth)
      auth['uid']
    end

    def updateable_user_attrs
      super + %i[first_name last_name custom_field_values]
    end

    def ui_method_name
      config[:ui_method_name] || name
    end
  end
end
