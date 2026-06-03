# frozen_string_literal: true

# NOTES: Domain partecipa.comune.modena.it

module CustomIdMethods::Federa
  class FederaOmniauth < IdMethods::Base
    include FederaVerification

    ENVIRONMENTS = {
      'test' => {
        metadata_xml_file: File.join(CustomIdMethods::Engine.root, 'config', 'saml', 'federa', 'idp_metadata_test.xml'),
        logout_url: 'https://federatest.lepida.it/logout/'
      },
      'production' => {
        metadata_xml_file: File.join(CustomIdMethods::Engine.root, 'config', 'saml', 'federa', 'idp_metadata_production.xml'),
        logout_url: 'https://federa.lepida.it/logout/'
      }
    }.freeze

    # FedERa uses standard SAML 2.0 authentication context classes mapped to ISO-IEC 29115 LoA levels,
    # not SPID-specific ones (cf. FedERa SP integration spec v1.6, chapter 13).
    FEDERA_AUTHN_CONTEXT = {
      '1' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
      '2' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:SecureRemotePassword',
      '3' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:Smartcard'
    }.freeze

    def profile_to_user_attrs(auth)
      attrs = unwrap_attrs(auth)

      custom_field_values = {}

      birthdate = attrs['dataNascita']
      if birthdate.present? && CustomField.find_by(key: 'birthyear')
        custom_field_values['birthyear'] = Date.parse(birthdate).year
      end

      # NOTE: Attribute not currently returned by Federa
      municipality_code = attrs['comuneDomicilio']
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
      attrs = unwrap_attrs(auth)
      attrs['spidCode'] || attrs['CodiceFiscale']
    end

    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      environment = config[:environment] || 'test'
      spid_level = config[:spid_level] || '1'

      certificate = config[:certificate]
      private_key = config[:private_key]

      metadata_file = ENVIRONMENTS.dig(environment, :metadata_xml_file)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      # FedERa requires a RelayState parameter in the SAML AuthnRequest. We also
      # use it to round-trip the original request's query params (token,
      # verification_pathname, sso_*, …) across the SAML POST callback, because
      # the session cookie that omniauth normally uses for this can't be relied
      # on: SAML's HTTP-POST binding is a cross-site POST, and depending on
      # SameSite/Secure cookie settings and the local SSL setup, the browser may
      # drop the cookie or Rails may refuse to write it. RelayState is opaque to
      # FedERa and echoed back in the response, so it's a safe carrier.
      handle_relay_state(env)

      options = idp_metadata.merge(
        issuer: "#{configuration.base_backend_uri}/auth/federa/metadata",
        assertion_consumer_service_url: "#{configuration.base_backend_uri}/auth/federa/callback",
        idp_sso_service_url_runtime_params: { RelayState: :RelayState },
        idp_sso_service_binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
        authn_context: FEDERA_AUTHN_CONTEXT.fetch(spid_level, FEDERA_AUTHN_CONTEXT['1']),
        request_attributes: []
      )

      if private_key.present?
        options[:certificate] = certificate if certificate.present?
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
      environment = config&.dig(:environment) || 'test'
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

    private

    # SAML attributes are inherently multi-valued, so ruby-saml exposes every
    # value as an array (e.g. `"nome" => ["Paolo"]`). FedERa only ever sends one
    # value per attribute, so we flatten to the first element for ergonomic access.
    def unwrap_attrs(auth)
      auth.dig(:extra, :raw_info).to_h.transform_values { |v| Array.wrap(v).first }
    end

    RELAY_STATE_CACHE_PREFIX = 'federa:relay_state:'
    RELAY_STATE_CACHE_TTL = 10.minutes

    def handle_relay_state(env)
      if env['PATH_INFO'].to_s.end_with?('/callback')
        restore_omniauth_params_from_relay_state(env)
      else
        stash_omniauth_params_in_relay_state(env)
      end
    end

    # Request phase: stash the incoming GET params in Rails.cache keyed by a
    # RelayState UUID, and ensure that UUID is in the query string so
    # omniauth-saml forwards it to the IdP as RelayState.
    def stash_omniauth_params_in_relay_state(env)
      query = Rack::Utils.parse_query(env['QUERY_STRING'] || '')
      relay_state = query['RelayState'].presence || SecureRandom.uuid

      params_to_stash = query.except('RelayState')
      if params_to_stash.any?
        Rails.cache.write(
          "#{RELAY_STATE_CACHE_PREFIX}#{relay_state}",
          params_to_stash,
          expires_in: RELAY_STATE_CACHE_TTL
        )
      end

      unless query.key?('RelayState')
        qs = env['QUERY_STRING'] || ''
        env['QUERY_STRING'] = qs.empty? ? "RelayState=#{relay_state}" : "#{qs}&RelayState=#{relay_state}"
      end
    end

    # Callback phase: read the RelayState that FedERa echoed back, look up the
    # original GET params in the cache, and inject them into the session under
    # 'omniauth.params'. OmniAuth::Strategy#callback_call (which runs right
    # after this setup_phase) reads `session.delete('omniauth.params')` into
    # `env['omniauth.params']`, so the controller sees the original `token`.
    def restore_omniauth_params_from_relay_state(env)
      relay_state = ActionDispatch::Request.new(env).params['RelayState']
      return if relay_state.blank?

      cache_key = "#{RELAY_STATE_CACHE_PREFIX}#{relay_state}"
      stashed = Rails.cache.read(cache_key)
      return unless stashed.is_a?(Hash)

      Rails.cache.delete(cache_key)

      session = env['rack.session']
      return unless session

      existing = session['omniauth.params'] || {}
      session['omniauth.params'] = stashed.merge(existing)
    end
  end
end
