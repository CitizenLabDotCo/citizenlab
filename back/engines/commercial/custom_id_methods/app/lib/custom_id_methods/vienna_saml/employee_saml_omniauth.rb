# frozen_string_literal: true

module CustomIdMethods::ViennaSaml
  # Provides a SAML Omniauth configuration for Vienna city employees.
  class EmployeeSamlOmniauth < IdMethods::Base
    # Vienna employee login is a login-only SSO method. Its configuration is stored
    # alongside the verification methods (in `verification.verification_methods`),
    # but it cannot be used to verify user identities.
    def verification?
      false
    end

    def verification_method_type
      :omniauth
    end

    def id
      '8fde8320-fb69-47a4-8bd9-1acbbf287ffc'
    end

    def name
      'vienna_employee'
    end

    def config_parameters
      %i[environment]
    end

    def config_parameters_schema
      {
        environment: {
          private: true,
          type: 'string',
          title: 'Environment',
          description: 'Test environment or live production environment',
          enum: %w[production test],
          default: 'production'
        }
      }
    end

    # The Issuer is hardcoded on Vienna's side and needs to match exactly.
    ENVIRONMENTS = {
      test: {
        issuer: 'CitizenLab',
        metadata_xml_file: File.join(CustomIdMethods::Engine.root, 'config', 'saml', 'vienna_saml', 'employee', 'idp_metadata_test.xml')
      },
      production: {
        issuer: 'CitizenLabWien',
        metadata_xml_file: File.join(CustomIdMethods::Engine.root, 'config', 'saml', 'vienna_saml', 'employee', 'idp_metadata_production.xml')
      }
    }.freeze

    USERID_KEY = 'urn:oid:0.9.2342.19200300.100.1.1'

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

    def profile_to_uid(auth)
      auth.dig(:extra, :raw_info).to_h[USERID_KEY].first
    end

    # Configures the SAML endpoint to authenticate with Vienna's IdP for employees
    # if the feature is enabled.
    # Most of the settings are read from the XML file that Vienna shared with us.
    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless IdMethodService.new.configured?(configuration, name)

      metadata_file = ENVIRONMENTS.dig(vienna_login_env, :metadata_xml_file)
      issuer = ENVIRONMENTS.dig(vienna_login_env, :issuer)

      idp_metadata_parser = OneLogin::RubySaml::IdpMetadataParser.new
      idp_metadata = idp_metadata_parser.parse_to_hash(File.read(metadata_file))

      metadata = idp_metadata.merge({ issuer: issuer })

      env['omniauth.strategy'].options.merge!(metadata)
    end

    # @return [Array<Symbol>] Returns a list of attributes that can be updated from the auth response hash
    def updateable_user_attrs
      super + %i[first_name last_name]
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
      "#{configuration.base_backend_uri}/auth/vienna_employee/callback"
    end

    # @return [Symbol] The configured Vienna Login environment as a symbol
    def vienna_login_env
      (config&.dig(:environment) || 'production').to_sym
    end
  end
end
