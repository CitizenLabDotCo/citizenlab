# frozen_string_literal: true

# NOTES: Domain partecipa.comune.modena.it

module IdFedera
  class FederaOmniauth < OmniauthMethods::Base
    include FederaVerification

    ENVIRONMENTS = {
      'test' => {
        metadata_xml_file: File.join(IdFedera::Engine.root, 'config', 'saml', 'idp_metadata_test.xml'),
        logout_url: 'https://federatest.lepida.it/logout/'
      },
      'production' => {
        metadata_xml_file: File.join(IdFedera::Engine.root, 'config', 'saml', 'idp_metadata_production.xml'),
        logout_url: 'https://federa.lepida.it/logout/'
      }
    }.freeze

    SPID_AUTHN_CONTEXT = {
      '1' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:SpidL1',
      '2' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:SpidL2',
      '3' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:SpidL3'
    }.freeze

    def profile_to_user_attrs(auth)
      attrs = auth.dig(:extra, :raw_info).to_h

      custom_field_values = {}

      # Handle birthyear
      birthdate = auth.extra.raw_info['dataNascita']
      if birthdate.present? && CustomField.find_by(key: 'birthyear')
        custom_field_values['birthyear'] = Date.parse(birthdate).year
      end

      # Handle municipality_code
      municipality_code = auth.extra.raw_info['comuneDomicilio']
      if municipality_code.present? && CustomField.find_by(key: 'municipality_code')
        custom_field_values['municipality_code'] = municipality_code
      end

      {
        first_name: attrs['nome'],
        last_name: attrs['cognome'],
        email: attrs['emailAddressPersonale'],
        custom_field_values: custom_field_values
      }.compact
    end

    def profile_to_uid(auth)
      attrs = auth.dig(:extra, :raw_info).to_h
      attrs['codiceIdentificativoSPID'] || attrs['codiceFiscale']
    end

    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('federa_login')

      environment = config[:environment] || 'test'
      spid_level = config[:spid_level] || '1'

      private_key = config[:private_key]

      metadata_file = ENVIRONMENTS.dig(environment, :metadata_xml_file)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      # FedERa requires a RelayState parameter in the SAML AuthnRequest.
      # omniauth-saml's additional_params_for_authn_request reads RelayState from
      # request.params via idp_sso_service_url_runtime_params. We inject a RelayState
      # into the query string so it gets picked up and forwarded to the IdP.
      unless Rack::Utils.parse_query(env['QUERY_STRING'] || '').key?('RelayState')
        relay_state = SecureRandom.uuid
        qs = env['QUERY_STRING'] || ''
        env['QUERY_STRING'] = qs.empty? ? "RelayState=#{relay_state}" : "#{qs}&RelayState=#{relay_state}"
      end

      options = idp_metadata.merge(
        issuer: "#{configuration.base_backend_uri}/auth/federa/metadata",
        assertion_consumer_service_url: "#{configuration.base_backend_uri}/auth/federa/callback",
        idp_sso_service_url_runtime_params: { RelayState: :RelayState },
        idp_sso_service_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        authn_context: SPID_AUTHN_CONTEXT.fetch(spid_level, SPID_AUTHN_CONTEXT['1']),
        request_attributes: []
      )

      if private_key.present?
        options[:private_key] = private_key
        options[:security] = {
          authn_requests_signed: true,
          signature_method: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1'
        }
      end

      env['omniauth.strategy'].options.merge!(options)
    end

    def logout_url(_user)
      configuration = AppConfiguration.instance
      environment = configuration.settings('federa_login', 'environment')
      base_url = ENVIRONMENTS.dig(environment, :logout_url)
      params = {
        spid: "#{configuration.base_backend_uri}/auth/federa/metadata",
        spurl: Frontend::UrlService.new.home_url
      }
      "#{base_url}?#{params.to_query}"
    end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h[:extra].delete(:response_object) }
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
