# frozen_string_literal: true

module IdTwoday
  class TwodayOmniauth < OmniauthMethods::Base
    include TwodayVerification

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        locale: AppConfiguration.instance.closest_locale_to('sv-SE')
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options
      options[:scope] = %i[openid]
      options[:response_type] = :code
      options[:issuer] = issuer
      options[:client_options] = {
        scheme: 'https',
        host: host,
        identifier: config[:client_id],
        secret: config[:client_secret],
        redirect_uri: "#{configuration.base_backend_uri}/auth/twoday/callback",

        # https://ticket-test1.siriusit.net/.well-known/openid-configuration
        discovery: true
      }
    end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(auth)
      false # No email returned from SSO
    end

    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h.delete(:credentials) }
    end

    def host
      config[:domain]
    end

    def issuer
      "https://#{host}/oidc-login" # TODO: converting to /oauth
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
