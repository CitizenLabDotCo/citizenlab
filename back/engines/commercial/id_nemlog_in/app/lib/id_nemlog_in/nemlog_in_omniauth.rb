# frozen_string_literal: true

module IdNemlogIn
  class NemlogInOmniauth < OmniauthMethods::Base
    include NemlogInVerification

    # Certs can be found here: https://www.nemlog-in.dk/metadata/#broker-idp
    ENVIRONMENTS = {
      pre_production_integration: {
        # But the certificates from `production_integration` are used, because the ones from `pre_production_integration` give "Invalid Signature on SAML Response"
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'pre_production_integration.xml')
      },
      production_integration: {
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'production_integration.xml')
      },
      production: {
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata', 'production.xml')
      }
    }.freeze

    def profile_to_user_attrs(auth)
      unique_code   = auth.extra.raw_info['https://data.gov.dk/model/core/eid/person/pid'] # NOTE: No email so we identify a user by unique code
      first_name    = auth.extra.raw_info['https://data.gov.dk/model/core/eid/firstName']
      last_name     = auth.extra.raw_info['https://data.gov.dk/model/core/eid/lastName']
      cpr_number    = auth.extra.raw_info['https://data.gov.dk/model/core/eid/cprNumber']
      birthdate     = auth.extra.raw_info['https://data.gov.dk/model/core/eid/dateOfBirth']
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first

      birthday_key = config[:birthday_custom_field_key]
      birthyear_key = config[:birthyear_custom_field_key]
      municipality_key = 'municipality_code'

      custom_field_values = {}
      custom_field_values[municipality_key] = fetch_municipality_code(cpr_number)
      custom_field_values[birthday_key] = birthdate if birthday_key && birthdate
      custom_field_values[birthyear_key] = Date.parse(birthdate).year if birthyear_key && birthdate

      {
        first_name: first_name,
        last_name: last_name,
        unique_code: unique_code,
        locale: locale,
        custom_field_values: custom_field_values
      }
    end

    # We don't want to store any PII, but also raises Stacklevel too deep error as here
    # back/engines/commercial/id_vienna_saml/app/lib/id_vienna_saml/citizen_saml_omniauth.rb
    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h[:extra].delete(:response_object) }
    end

    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      verification_config = config

      metadata_file = ENVIRONMENTS.dig(verification_config[:environment].to_sym, :metadata_xml_file)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      metadata = idp_metadata.merge({
        sp_entity_id: verification_config[:issuer],

        # without it (or with assertion_consumer_service_url: nil), localtunnel gives "502 Bad Gateway nginx/1.17.9"
        # after clicking "Verify with MitID" on https://nemlogin-k3kd.loca.lt/auth/nemlog_in?token=eyJhbGc...
        # Probably, because the request has a token and so the size of request is too big
        # <samlp:AuthnRequest AssertionConsumerServiceURL='https://nemlogin-k3kd.loca.lt/auth/nemlog_in/callback?token=eyJhbG
        # Nemlog-in also fails without this line.
        assertion_consumer_service_url: redirect_uri(configuration),

        # certificate: verification_config[:certificate], # not required as it's used in our SP metadata file, which is uploaded to NemLog-in
        private_key: verification_config[:private_key], # should start with "-----BEGIN PRIVATE KEY-----". "Bag Attributes" part should be removed
        # Transform `token` param to `RelayState`, which is preserved by SAML.
        # Nemlog-in gives error if it's longer than 512 chars.
        # NOTE: not sure why this is commented out, but does not verify locally when it is enabled
        # idp_sso_service_url_runtime_params: { token: :RelayState },
        idp_slo_service_url: idp_metadata[:idp_slo_service_url],

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
      super + %i[custom_field_values]
    end

    def locked_custom_fields
      [
        :municipality_code,
        config[:birthday_custom_field_key].presence,
        config[:birthyear_custom_field_key].presence
      ].compact
    end

    def locked_attributes
      %i[]
    end

    # TODO: JS - implement single logout (if possible)
    # def logout_url(_user)
    #   URI.join(Frontend::UrlService.new.home_url, '/auth/nemlog_in/spslo').to_s
    # end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(_auth)
      false
    end

    private

    def fetch_municipality_code(cpr_number)
      IdNemlogIn::KkiLocationApi.new.municipality_code(cpr_number)
    end

    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/nemlog_in/callback"
    end
  end
end
