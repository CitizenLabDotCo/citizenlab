module IdViennaSaml
  class IdViennaSamlOmniauth

    # Takes the Omniauth auth hash and extracts user attributes out of it
    # @param [Hash] auth
    # @return [Hash] The user attributes
    def profile_to_user_attrs(auth)
      attrs = auth.dig(:extra, :raw_info).to_h

      {
        email: attrs.fetch("urn:oid:0.9.2342.19200300.100.1.3").first,
        first_name: attrs.fetch("urn:oid:2.5.4.42").first,
        last_name: attrs.fetch("urn:oid:1.2.40.0.10.2.1.1.261.20").first,
        locale: AppConfiguration.instance.settings.dig("core", "locales").first
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('vienna_login')

      fixed_metadata = {
        issuer: 'CitizenLabNgrok',
        assertion_consumer_service_url: 'http://citizenlab.eu.ngrok.io/auth/saml/callback'
      }

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(idp_metadata_xml)
      metadata = idp_metadata.merge(fixed_metadata)

      env['omniauth.strategy'].options.merge!(metadata)
    end

    def updateable_user_attrs
      %i[first_name last_name]
    end

    # Removes the response object because it produces a Stacklevel too deep error when converting to JSON
    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup()
      auth_to_persist.tap { |h| h[:extra].delete(:response_object) }
    end

    private

    # @param [AppConfiguration] configuration
    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/saml/callback"
    end

    def idp_metadata_xml
      File.read(idp_metadata_xml_file)
    end

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
