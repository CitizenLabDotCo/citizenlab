# frozen_string_literal: true

module CustomAuthVerification
  class HoplrOmniauth < OmniauthMethods::Base
    include Verification::VerificationMethod # Included directly as this merely uses the verification config

    def name
      'hoplr'
    end

    def verification_method_type
      :omniauth
    end

    def config_parameters
      %i[client_id client_secret enabled_for_verified_actions]
    end

    def config_parameters_schema
      {
        client_id: {
          private: true,
          type: 'string',
          description: 'Client ID.'
        },
        client_secret: {
          private: true,
          type: 'string',
          description: 'Client secret.'
        },
        environment: {
          type: 'string',
          title: 'Environment',
          description: 'Live on the production environment or still testing on their test environment?',
          enum: %w[test production],
          default: 'production',
          private: true
        },
        neighbourhood_custom_field_key: {
          private: true,
          type: 'string',
          title: 'Neighbourhood custom field key',
          description: 'The `key` attribute of the custom field where the neighbourhood should be stored. Leave empty to not store the neighbourhood.'
        },
        enabled_for_verified_actions: {
          private: true,
          type: 'boolean',
          description: 'Whether this verification method should be enabled for verified actions.'
        }
      }
    end

    def profile_to_user_attrs(auth)
      settings = AppConfiguration.instance.settings

      custom_field_values = {}

      neighbourhood = auth.extra.raw_info['neighbourhood']
      if (neighbourhood_key = config[:neighbourhood_custom_field_key]) && neighbourhood
        custom_field_values[neighbourhood_key] = neighbourhood
      end

      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        locale: settings.dig('core', 'locales').first,
        email: auth.info.email,
        custom_field_values: custom_field_values
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless config[:client_id] && config[:client_secret]

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
      case config[:environment]
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
