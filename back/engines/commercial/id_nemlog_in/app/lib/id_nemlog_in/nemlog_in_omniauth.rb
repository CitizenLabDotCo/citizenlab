# frozen_string_literal: true

module IdNemlogIn
  class NemlogInOmniauth < OmniauthMethods::Base
    include NemlogInVerification

    ENVIRONMENTS = {
      pre_production_integration: {
        # https://www.nemlog-in.dk/vejledningertiltestmiljo/forside/test-som-tjenesteudbyder-eller-broker/
        # But the certificates from `production_integration` are used, because the ones from `pre_production_integration` give "Invalid Signature on SAML Response"
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'pre_production_integration.xml')
      },
      production_integration: {
        # https://tu.nemlog-in.dk/oprettelse-og-administration-af-tjenester/log-in/dokumentation.og.guides/integrationstestmiljo/
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'production_integration.xml')
      },
      production: {
        # https://tu.nemlog-in.dk/oprettelse-og-administration-af-tjenester/log-in/dokumentation.og.guides/produktionsmiljo/
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'production.xml')
      }
    }.freeze

    def profile_to_user_attrs(auth)
      first_name    = auth.extra.raw_info['https://data.gov.dk/model/core/eid/firstName']
      last_name     = auth.extra.raw_info['https://data.gov.dk/model/core/eid/lastName']
      date_of_birth = auth.extra.raw_info['https://data.gov.dk/model/core/eid/dateOfBirth'] # "01-02-1999"
      cpr_number    = auth.extra.raw_info['https://data.gov.dk/model/core/eid/cprNumber']

      {
        first_name: first_name,
        last_name: last_name,
        custom_field_values: {
          municipality_code: fetch_municipality_code(cpr_number),
          date_of_birth: date_of_birth
        }
      }
    end

    def profile_to_uid(auth)
      auth.extra.raw_info['https://data.gov.dk/model/core/eid/cprUuid']
    end

    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      verification_config = config

      metadata_file = ENVIRONMENTS.dig(verification_config[:environment].to_sym, :metadata_xml_file)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      metadata = idp_metadata.merge({
        issuer: verification_config[:issuer],

        # without it (or with assertion_consumer_service_url: nil), I get "502 Bad Gateway nginx/1.17.9"
        # after clicking "Verify with MitID" on https://nemlogin-k3kd.loca.lt/auth/nemlog_in?token=eyJhbGc...
        # Probably, because the request has a token and so the size of request is too big
        # <samlp:AuthnRequest AssertionConsumerServiceURL='https://nemlogin-k3kd.loca.lt/auth/nemlog_in/callback?token=eyJhbG
        # assertion_consumer_service_url: 'https://nemlogin-k3kd.loca.lt/auth/nemlog_in/callback',

        # certificate: verification_config[:certificate], # not required as it's used in our SP metadata file, which is uploaded to NemLog-in
        private_key: verification_config[:private_key], # should start with "-----BEGIN PRIVATE KEY-----". "Bag Attributes" part should be removed
        # Transform `token` param to `RelayState`, which is preserved by SAML.
        # Nemlog-in gives error if it's longer than 512 chars.
        # idp_sso_target_url_runtime_params: { token: :RelayState },

        security: {
          authn_requests_signed: true, # using false gives "A technical error has occurred" on https://test-devtest4-nemlog-in.pp.mitid.dk/
          signature_method: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
          # Any of these gives "A technical error has occurred" on https://test-devtest4-nemlog-in.pp.mitid.dk/
          # digest_method: 'http://www.w3.org/2000/09/xmldsig#sha1',
          # signature_method: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1'
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

    # environment - see ENVIRONMENTS keys for available values
    # issuer      - entityID from SP metadata file (usually domain name with protocol)
    # private_key - private key. Public key is specified in SP metadata file
    def config_parameters
      %i[environment issuer private_key]
    end

    # TODO: implement
    def logout_url; end

    private

    def fetch_municipality_code(_cpr_number)
      # '0101'
    end

    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/nemlog_in/callback"
    end
  end
end
