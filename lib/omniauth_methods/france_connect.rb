module OmniauthMethods
  class FranceConnect
    include Verification::Methods::FranceConnect

    def profile_to_user_attrs auth
      # Todo: Do something smart with the address auth.extra.raw_info.address.formatted
      {
        first_name: auth.info['first_name'],
        email: auth.info['email'],
        last_name: auth.info['last_name'].titleize, # FC returns last names in ALL CAPITALS
        locale: Tenant.current.closest_locale_to('fr-FR'),
        remote_avatar_url: auth.info['image'],
      }.tap do |attrs|
        custom_fields = CustomField.fields_for('User').enabled.pluck(:code)
        if custom_fields.include?('birthyear')
          attrs[:birthyear] = (Date.parse(auth.extra.raw_info.birthdate)&.year rescue nil)
        end
        if custom_fields.include?('gender')
          attrs[:gender] = auth.extra.raw_info.gender
        end
      end
    end

    def omniauth_setup tenant, env
      if tenant.has_feature?('franceconnect_login')
        options = env['omniauth.strategy'].options
        options[:scope] = [:openid, :profile, :email, :address]
        options[:response_type] = :code
        options[:state] = true # Requis par France connect
        options[:nonce] = true # Requis par France connect
        options[:issuer] = "https://#{host}" # L'environnement d'intégration utilise à présent 'https'
        options[:client_auth_method] = 'Custom' # France connect n'utilise pas l'authent "BASIC".
        options[:client_signing_alg] = :HS256   # Format de hashage France Connect
        options[:client_options] = {
          identifier: Tenant.settings("franceconnect_login", "identifier"),
          secret: Tenant.settings("franceconnect_login", "secret"),
          port: 443,
          scheme: 'https',
          host: host,
          redirect_uri: "#{tenant.base_backend_uri}/auth/franceconnect/callback",
          authorization_endpoint: '/api/v1/authorize',
          token_endpoint: '/api/v1/token',
          userinfo_endpoint: '/api/v1/userinfo'
        }

      end
    end

    def logout_url user
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
      case Tenant.settings("franceconnect_login", "environment")
      when "integration"
        'fcp.integ01.dev-franceconnect.fr'
      when "production"
        'app.franceconnect.gouv.fr'
      end
    end

    def updateable_user_attrs
      [:first_name, :last_name, :birthyear, :remote_avatar_url]
    end

  end
end