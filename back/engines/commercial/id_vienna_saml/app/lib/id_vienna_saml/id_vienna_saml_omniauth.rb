module IdViennaSaml
  # Provides a SAML Omniauth configuration for Vienna's StandardPortal.
  class IdViennaSamlOmniauth
    FIXED_METADATA = { issuer: 'CitizenLab' }.freeze

    # Extracts user attributes from the Omniauth response auth.
    # @param [OmniAuth::AuthHash] auth
    # @return [Hash] The user attributes
    def profile_to_user_attrs(auth)
      attrs = auth.dig(:extra, :raw_info).to_h

      {
        email: attrs.fetch('urn:oid:0.9.2342.19200300.100.1.3').first,
        first_name: attrs.fetch('urn:oid:2.5.4.42').first,
        last_name: attrs.fetch('urn:oid:1.2.40.0.10.2.1.1.261.20').first,
        locale: AppConfiguration.instance.settings.dig('core', 'locales').first
      }
    end

    # Configures the the SAML endpoint to authenticate with Vienna's StandardPortal
    # if the feature is enabled.
    # Most of the settings are read from the XML file that Vienna shared with us.
    # The issuer though needs to be hard-coded to 'CitizenLab'.
    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('vienna_login')

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(idp_metadata_xml)
      metadata = idp_metadata.merge(FIXED_METADATA)

      env['omniauth.strategy'].options.merge!(metadata)
    end

    # @return [Array<Symbol>] Returns a list of attributes that can be updated from the auth response hash
    def updateable_user_attrs
      %i[first_name last_name]
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
      "#{configuration.base_backend_uri}/auth/saml/callback"
    end

    def idp_metadata_xml
      File.read(idp_metadata_xml_file)
    end

    # Returns the XML file that contains the Metatdata of the SAML IdP based
    # on the configured environment
    def idp_metadata_xml_file
      env = AppConfiguration.instance.settings('vienna_login', 'environment')
      case env
      when 'test'
        File.join(IdViennaSaml::Engine.root, 'config', 'idp_metadata_test.xml')
      when 'production'
        File.join(IdViennaSaml::Engine.root, 'config', 'idp_metadata_production.xml')
      else
        raise "No Idp metadata known for vienna_login env: #{env}"
      end
    end
  end
end
