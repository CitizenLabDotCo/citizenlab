# frozen_string_literal: true

module IdNemlogIn
  # Provides a SAML Omniauth configuration for Vienna's StandardPortal, a citizen SSO method.
  class NemlogInOmniauth < OmniauthMethods::Base
    include NemlogInVerification

    ENVIRONMENTS = {
      test: {
        issuer: 'CitizenLab',
        # copied from https://github.com/digst/OIOSAML.Net/blob/master/src/dk.nita.saml20/WebsiteDemo/idp-metadata/test-devtest4-idp-metadata.xml
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata_test.xml')
      },
      production: {
        issuer: 'CitizenLabWien',
        metadata_xml_file: File.join(IdNemlogIn::Engine.root, 'config', 'saml', 'idp_metadata_production.xml')
      }
    }.freeze

    # Extracts user attributes from the Omniauth response auth.
    # @param [OmniAuth::AuthHash] auth
    # @return [Hash] The user attributes
    def profile_to_user_attrs(auth)
      attrs = auth.dig(:extra, :raw_info).to_h
      email = attrs.fetch('urn:oid:0.9.2342.19200300.100.1.3').first
      placeholder_name = generate_placeholder_name_from_email(email)
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first
      first_name = attrs['urn:oid:2.5.4.42']&.first || placeholder_name[:first_name]
      last_name = attrs['urn:oid:1.2.40.0.10.2.1.1.261.20']&.first || placeholder_name[:last_name]

      {
        email: email,
        first_name: first_name,
        last_name: last_name,
        locale: locale
      }
    end

    # Configures the SAML endpoint to authenticate with Vienna's StandardPortal
    # if the feature is enabled.
    # Most of the settings are read from the XML file that Vienna shared with us.
    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      # return unless configuration.feature_activated?('vienna_citizen_login')

      metadata_file = ENVIRONMENTS.dig(:test, :metadata_xml_file)
      issuer = ENVIRONMENTS.dig(:test, :issuer)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      metadata = idp_metadata.merge({ issuer: issuer })

      env['omniauth.strategy'].options.merge!(metadata)
      # env['omniauth.strategy'].options.merge!(issuer: 'CitizenLab')
    end

    # @return [Array<Symbol>] Returns a list of attributes that can be updated from the auth response hash
    def updateable_user_attrs
      %i[first_name last_name]
    end

    # @return [Boolean] If existing user attributes should be overwritten
    def overwrite_user_attrs?
      false
    end

    # Removes the response object because it produces a Stacklevel too deep error when converting to JSON
    # @param [OmniAuth::AuthHash] auth
    # @return [Hash] The filtered hash that will be persisted in the database
    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h[:extra].delete(:response_object) }
    end

    private

    # @param [AppConfiguration] configuration
    # @return [String] The path to the callback URL
    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/vienna_citizen/callback"
    end

    # @return [Symbol] The configured Vienna Login environment as a symbol
    def vienna_login_env
      AppConfiguration.instance.settings('vienna_citizen_login', 'environment').to_sym
    end
  end
end
