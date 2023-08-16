# frozen_string_literal: true

module IdNemlogIn
  class NemlogInOmniauth < OmniauthMethods::Base
    include NemlogInVerification

    ENVIRONMENTS = {
      pre_production_integration: {
        issuer: 'https://nemlogin-k3kd.loca.lt',
        # https://www.nemlog-in.dk/vejledningertiltestmiljo/forside/test-som-tjenesteudbyder-eller-broker/
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'pre_production_integration.xml')
      },
      production_integration: {
        issuer: 'https://kobenhavntaler.kk.dk',
        # https://tu.nemlog-in.dk/oprettelse-og-administration-af-tjenester/log-in/dokumentation.og.guides/integrationstestmiljo/
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'production_integration.xml')
      },
      production: {
        issuer: 'https://kobenhavntaler.kk.dk',
        # https://tu.nemlog-in.dk/oprettelse-og-administration-af-tjenester/log-in/dokumentation.og.guides/produktionsmiljo/
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'production.xml')
      }
    }.deep_stringify_keys.freeze

    def profile_to_user_attrs(auth)
      first_name = auth.extra.raw_info['https://data.gov.dk/model/core/eid/firstName']
      last_name = auth.extra.raw_info['https://data.gov.dk/model/core/eid/lastName']
      date_of_birth = auth.extra.raw_info['https://data.gov.dk/model/core/eid/dateOfBirth'] # "01-02-1999"
      cpr_number = auth.extra.raw_info['https://data.gov.dk/model/core/eid/cprNumber']
      # age = auth.extra.raw_info['https://data.gov.dk/model/core/eid/age']

      {
        first_name: first_name,
        last_name: last_name,
        custom_field_values: {
          municipality_code: fetch_municipality_code(cpr_number),
          date_of_birth: date_of_birth
          # age: age
        }
      }
    end

    def profile_to_uid(auth)
      auth.extra.raw_info['https://data.gov.dk/model/core/eid/cprUuid']
    end

    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      ver_config = config

      metadata_file = ENVIRONMENTS.dig(ver_config[:environment], 'metadata_xml_file')
      issuer = ENVIRONMENTS.dig(ver_config[:environment], 'issuer')

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      metadata = idp_metadata.merge({
        issuer: issuer,
        assertion_consumer_service_url: nil,
        idp_cert: ver_config[:certificate], # can start with "Bag Attributes"
        private_key: ver_config[:private_key], # should start with "-----BEGIN PRIVATE KEY-----" not "Bag Attributes"
        security: {
          authn_requests_signed: true,
          signature_method: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
        }
      })

      env['omniauth.strategy'].options.merge!(metadata)
    end

    def updateable_user_attrs
      %i[first_name last_name custom_field_values]
    end

    def locked_custom_fields
      %i[municipality_code date_of_birth]
    end

    def locked_attributes
      %i[]
    end

    # TODO: implement
    def logout_url; end

    private

    def fetch_municipality_code(_cpr_number)
      '0101'
    end

    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/nemlog_in/callback"
    end
  end
end
