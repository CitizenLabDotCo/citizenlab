# frozen_string_literal: true

module IdHoplr
  class HoplrOmniauth < IdMethod::Base
    include IdMethod::OmniAuthMethod

    def profile_to_user_attrs(auth)
      settings = AppConfiguration.instance.settings

      custom_field_values = {}

      neighbourhood = auth.extra.raw_info['neighbourhood']
      if (neighbourhood_key = settings.dig('hoplr_login', 'neighbourhood_custom_field_key')) && neighbourhood
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
      return unless configuration.feature_activated?('hoplr_login')

      feature = configuration.settings('hoplr_login')

      options = env['omniauth.strategy'].options

      scope = %i[openid email profile email_verified]
      scope << :neighbourhood if feature['neighbourhood_custom_field_key'].present?
      options[:scope] = scope

      # it gets configuration from https://test.hoplr.com/.well-known/openid-configuration
      options[:discovery] = true

      options[:response_type] = :code
      options[:state] = true
      options[:nonce] = true
      options[:send_scope_to_token_endpoint] = false
      options[:issuer] = issuer
      options[:client_options] = {
        identifier: feature['client_id'],
        secret: feature['client_secret'],
        port: 443,
        scheme: 'https',
        host: host,
        redirect_uri: "#{configuration.base_backend_uri}/auth/hoplr/callback"
      }
    end

    def host
      case AppConfiguration.instance.settings('hoplr_login', 'environment')
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
