# frozen_string_literal: true

module IdClaveUnica
  class ClaveUnicaOmniauth < OmniauthMethods::Base
    include ClaveUnicaVerification

    def profile_to_user_attrs(auth)
      info = {
        locale: AppConfiguration.instance.closest_locale_to('es-CL')
      }

      if (fn = auth.dig('extra', 'raw_info', 'name', 'nombres'))
        info[:first_name] = fn.join(' ')
      end
      if (ln = auth.dig('extra', 'raw_info', 'name', 'apellidos'))
        info[:last_name] = ln.join(' ')
      end

      # We save formatted RUT in IdCard to be able to use this table for IdCard verification
      # (so, that users enter their RUT in its usual format)
      if IdIdCardLookup::IdCard.find_by_card_id(formatted_rut(auth))
        info[:custom_field_values] = { rut_verified: true }
      end

      info
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name) || configuration.feature_activated?('clave_unica_login')

      options = env['omniauth.strategy'].options
      options[:scope] = %i[openid run name]
      options[:response_type] = :code
      options[:state] = true
      options[:nonce] = true
      options[:issuer] = issuer
      options[:send_scope_to_token_endpoint] = false
      options[:client_signing_alg] = :RS256 # can be autodetected, but specified for clarity
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
        jwks_uri: 'https://accounts.claveunica.gob.cl/openid/jwks'
      }
    end

    def host
      'accounts.claveunica.gob.cl'
    end

    def issuer
      "https://#{host}/openid"
    end

    def updateable_user_attrs
      %i[first_name last_name custom_field_values]
    end

    def locked_custom_fields
      %i[rut_verified]
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

    def verification_prioritized?
      true
    end

    private

    def formatted_rut(auth)
      info = auth.dig('extra', 'raw_info')
      dv = info.dig('RolUnico', 'DV')

      return if info['sub'].blank? || dv.blank?

      (info['sub'] + dv).gsub(/(\d{1,3})(\d{3})(\d{3})([\dkK])/, '\1.\2.\3-\4')
    end
  end
end
