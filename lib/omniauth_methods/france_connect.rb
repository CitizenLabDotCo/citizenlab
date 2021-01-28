module OmniauthMethods
  class FranceConnect
    include Verification::Methods::FranceConnect

    def profile_to_user_attrs(auth)
      # Todo: Do something smart with the address auth.extra.raw_info.address.formatted
      {
        first_name: auth.info['first_name'],
        email: auth.info['email'],
        last_name: auth.info['last_name'].titleize, # FC returns last names in ALL CAPITALS
        locale: AppConfiguration.instance.closest_locale_to('fr-FR'),
        remote_avatar_url: auth.info['image'],
      }.tap do |attrs|
        custom_fields = CustomField.with_resource_type('User').enabled.pluck(:code)
        if custom_fields.include?('birthyear')
          attrs[:birthyear] = (Date.parse(auth.extra.raw_info.birthdate)&.year rescue nil)
        end
        if custom_fields.include?('gender')
          attrs[:gender] = auth.extra.raw_info.gender
        end
      end
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.has_feature?('franceconnect_login')

      env['omniauth.strategy'].options.merge!({
        scope: [:openid, :profile, :email, :address],
        response_type: :code,
        state: true, # required by France connect
        nonce: true, # required by France connect
        issuer: "https://#{host}", # the integration env is now using 'https'
        client_auth_method: 'Custom', # France connect does not use BASIC authentication
        client_signing_alg: :HS256, # hashing function of France Connect
        client_options: {
          identifier: configuration.settings("franceconnect_login", "identifier"),
          secret: configuration.settings("franceconnect_login", "secret"),
          port: 443,
          scheme: 'https',
          host: host,
          redirect_uri: redirect_uri(configuration),
          authorization_endpoint: '/api/v1/authorize',
          token_endpoint: '/api/v1/token',
          userinfo_endpoint: '/api/v1/userinfo'
        }
      })
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
      case AppConfiguration.instance.settings("franceconnect_login", "environment")
      when "integration" then
        'fcp.integ01.dev-franceconnect.fr'
      when "production" then
        'app.franceconnect.gouv.fr'
      end
    end

    def updateable_user_attrs
      [:first_name, :last_name, :birthyear, :remote_avatar_url]
    end

    private

    # @param [AppConfiguration] configuration
    def redirect_uri(configuration)
      "#{configuration.base_backend_uri}/auth/franceconnect/callback"
    end

  end
end