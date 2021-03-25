# frozen_string_literal: true

module IdClaveUnica
  class ClaveUnicaOmniauth

    include ClaveUnicaVerification

    def profile_to_user_attrs(auth)
      info = {}
      if fn = auth.dig('extra', 'raw_info', 'name', 'nombres')
        info[:first_name] = fn.join(" ")
      end
      if ln = auth.dig('extra', 'raw_info', 'name', 'apellidos')
        info[:last_name] = ln.join(" ")
      end
      info
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      if Verification::VerificationService.new.is_active?(configuration, name)
        options = env['omniauth.strategy'].options
        options[:scope] = [:openid, :run, :name]
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
          redirect_uri: "#{configuration.base_backend_uri}/auth/clave_unica/callback",
        }
      end
    end

    def host
      'accounts.claveunica.gob.cl'
    end

    def issuer
      "https://#{host}"
    end

    def updateable_user_attrs
      [:first_name, :last_name]
    end

    def logout_url(user)
      url_params = {
        redirect: Frontend::UrlService.new.home_url
      }

      "https://#{host}/api/v1/accounts/app/logout?#{url_params.to_query}"
    end

  end

end