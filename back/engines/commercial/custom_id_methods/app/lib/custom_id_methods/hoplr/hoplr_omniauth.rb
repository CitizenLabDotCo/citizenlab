# frozen_string_literal: true

module CustomIdMethods::Hoplr
  class HoplrOmniauth < IdMethods::Base
    include IdMethods::BaseIdMethod

    # Hoplr is a login-only SSO method. Its configuration is stored alongside the
    # verification methods (in `verification.verification_methods`), but it cannot
    # be used to verify user identities.
    def verification?
      false
    end

    def verification_method_type
      :omniauth
    end

    def id
      '115a0b5a-073d-45a5-9ca5-657b02c1c771'
    end

    def name
      'hoplr'
    end

    def config_parameters
      %i[environment client_id client_secret neighbourhood_custom_field_key]
    end

    def config_parameters_schema
      {
        environment: {
          private: true,
          type: 'string',
          title: 'Environment',
          description: 'Live on the production environment or still testing on their test environment?',
          enum: %w[test production],
          default: 'production'
        },
        client_id: {
          private: true,
          type: 'string',
          title: 'Client ID'
        },
        client_secret: {
          private: true,
          type: 'string',
          title: 'Client Secret'
        },
        neighbourhood_custom_field_key: {
          private: true,
          type: 'string',
          title: 'Neighbourhood custom field key',
          description: 'The `key` attribute of the custom field where the neighbourhood should be stored. Leave empty to not store the neighbourhood.'
        }
      }
    end

    def profile_to_user_attrs(auth)
      custom_field_values = {}

      neighbourhood = auth.extra.raw_info['neighbourhood']
      if (neighbourhood_key = config&.dig(:neighbourhood_custom_field_key)) && neighbourhood
        custom_field_values[neighbourhood_key] = neighbourhood
      end

      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        locale: AppConfiguration.instance.settings.dig('core', 'locales').first,
        email: auth.info.email,
        custom_field_values: custom_field_values
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless IdMethodService.new.configured?(configuration, name)

      options = env['omniauth.strategy'].options

      scope = %i[openid email profile email_verified]
      scope << :neighbourhood if config[:neighbourhood_custom_field_key].present?
      options[:scope] = scope

      # it gets configuration from https://test.hoplr.com/.well-known/openid-configuration
      options[:discovery] = true

      options[:response_type] = :code
      options[:state] = true
      options[:nonce] = true
      options[:send_scope_to_token_endpoint] = false
      options[:issuer] = issuer
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        port: 443,
        scheme: 'https',
        host: host,
        redirect_uri: "#{configuration.base_backend_uri}/auth/hoplr/callback"
      }
    end

    def host
      case config&.dig(:environment)
      when 'test'       then 'test.hoplr.com'
      when 'production' then 'www.hoplr.com'
      end
    end

    def issuer
      "https://#{host}/"
    end

    def updateable_user_attrs
      super + %i[first_name last_name custom_field_values]
    end

    def locked_custom_fields
      %i[neighbourhood]
    end

    def email_confirmed?(auth)
      auth.info.email_verified
    end
  end
end
