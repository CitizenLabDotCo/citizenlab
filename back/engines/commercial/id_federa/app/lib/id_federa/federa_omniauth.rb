# frozen_string_literal: true

module IdFedera
  class FederaOmniauth < OmniauthMethods::Base
    include FederaVerification

    ENVIRONMENTS = {
      'test' => {
        metadata_xml_file: File.join(IdFedera::Engine.root, 'config', 'saml', 'idp_metadata_test.xml')
      },
      'production' => {
        metadata_xml_file: File.join(IdFedera::Engine.root, 'config', 'saml', 'idp_metadata_production.xml')
      }
    }.freeze

    SPID_AUTHN_CONTEXT = {
      '1' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:SpidL1',
      '2' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:SpidL2',
      '3' => 'urn:oasis:names:tc:SAML:2.0:ac:classes:SpidL3'
    }.freeze

    def profile_to_user_attrs(auth)
      attrs = auth.dig(:extra, :raw_info).to_h

      {
        first_name: attrs['name'],
        last_name: attrs['familyName'],
        email: attrs['email']
      }.compact
    end

    def profile_to_uid(auth)
      attrs = auth.dig(:extra, :raw_info).to_h
      attrs['spidCode'] || attrs['fiscalNumber']
    end

    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('federa_login')

      environment = configuration.settings('federa_login', 'environment')
      spid_level = configuration.settings('federa_login', 'spid_level')

      metadata_file = ENVIRONMENTS.dig(environment, :metadata_xml_file)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      # binding.pry

      options = idp_metadata.merge(
        issuer: "#{configuration.base_backend_uri}/auth/federa/metadata",
        assertion_consumer_service_url: "#{configuration.base_backend_uri}/auth/federa/callback",
        authn_context: SPID_AUTHN_CONTEXT.fetch(spid_level, SPID_AUTHN_CONTEXT['1']),
        security: {
          authn_requests_signed: true,
          signature_method: XMLSecurity::Document::RSA_SHA256
        }
      )

      env['omniauth.strategy'].options.merge!(options)
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
