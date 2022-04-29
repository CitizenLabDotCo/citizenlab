# FranceConnect works locally with any of these identifiers
# https://github.com/france-connect/identity-provider-example/blob/master/database.csv
module IdFranceconnect
  class FranceconnectOmniauth
    include FranceconnectVerification

    def profile_to_user_attrs(auth)
      # TODO: Do something smart with the address auth.extra.raw_info.address.formatted
      {
        first_name: auth.info['first_name'],
        email: auth.info['email'],
        last_name: auth.info['last_name'].titleize, # FC returns last names in ALL CAPITALS
        locale: AppConfiguration.instance.closest_locale_to('fr-FR'),
        remote_avatar_url: auth.info['image']
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('franceconnect_login')

      env['omniauth.strategy'].options.merge!(
        scope: %i[openid given_name family_name email],
        response_type: :code,
        state: true, # required by France connect
        nonce: true, # required by France connect
        issuer: issuer, # the integration env is now using 'https'
        client_auth_method: 'Custom', # France connect does not use BASIC authentication
        acr_values: 'eidas1',
        client_signing_alg: :HS256, # hashing function of France Connect
        client_options: {
          identifier: configuration.settings('franceconnect_login', 'identifier'),
          secret: configuration.settings('franceconnect_login', 'secret'),
          scheme: 'https',
          host: host,
          port: 443,
          redirect_uri: redirect_uri(configuration),
          authorization_endpoint: '/api/v1/authorize',
          token_endpoint: '/api/v1/token',
          userinfo_endpoint: '/api/v1/userinfo'
        }
      )
    end

    def logout_url(user)
      last_identity = user.identities
                          .where(provider: 'franceconnect')
                          .order(created_at: :desc)
                          .limit(1)
                        &.first
      id_token = last_identity.auth_hash.dig('credentials', 'id_token')

      url_params = {
        id_token_hint: id_token,
        post_logout_redirect_uri: Frontend::UrlService.new.home_url
      }

      "https://#{host}/api/v1/logout?#{url_params.to_query}"
    end

    def host
      case AppConfiguration.instance.settings('franceconnect_login', 'environment')
      when 'integration' then
        'fcp.integ01.dev-franceconnect.fr'
      when 'production' then
        'app.franceconnect.gouv.fr'
      end
    end

    def issuer
      "https://#{host}"
    end

    def updateable_user_attrs
      %i[first_name last_name birthyear remote_avatar_url]
    end

    private

    # @param [AppConfiguration] configuration
    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/franceconnect/callback"
    end
  end
end
