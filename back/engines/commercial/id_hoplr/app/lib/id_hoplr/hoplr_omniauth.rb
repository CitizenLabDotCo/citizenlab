# frozen_string_literal: true

module IdHoplr
  class HoplrOmniauth < OmniauthMethods::Base
    def profile_to_user_attrs(auth)
      first_name, last_name = auth.info.name.split(' ', 2)
      locale = AppConfiguration.instance.settings.dig('core', 'locales').first

      {
        first_name: first_name,
        last_name: last_name,
        locale: locale,
        email: auth.info.email
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('hoplr_login')

      feature = configuration.settings('hoplr_login')

      options = env['omniauth.strategy'].options
      options[:scope] = %i[openid email profile]
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
      when 'production' then 'hoplr.com'
      end
    end

    def issuer
      "https://#{host}/"
    end

    def updateable_user_attrs
      %i[first_name last_name]
    end
  end
end
