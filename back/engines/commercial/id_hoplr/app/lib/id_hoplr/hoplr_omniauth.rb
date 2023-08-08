# frozen_string_literal: true

module IdHoplr
  class HoplrOmniauth < OmniauthMethods::Base
    def profile_to_user_attrs(auth)
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('hoplr_login')

      options = env['omniauth.strategy'].options
      options[:scope] = %i[openid run name]
      options[:response_type] = :code
      options[:state] = true
      options[:nonce] = true
      options[:issuer] = issuer
      options[:send_scope_to_token_endpoint] = false
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        port: 443,
        scheme: 'https',
        host: host,
        authorization_endpoint: '/openid/authorize',
        token_endpoint: '/openid/token',
        userinfo_endpoint: '/openid/userinfo',
        redirect_uri: "#{configuration.base_backend_uri}/auth/hoplr/callback",
        jwks_uri: 'https://accounts.Hoplr.gob.cl/openid/jwks'
      }
    end

    def host
    end

    def issuer
      "https://#{host}/openid"
    end

    def updateable_user_attrs
      %i[first_name last_name]
    end

    def logout_url(_user)
      url_params = {
        redirect: Frontend::UrlService.new.home_url
      }

      "https://#{host}/api/v1/accounts/app/logout?#{url_params.to_query}"
    end

    def email_always_present?
      false
    end
  end
end
