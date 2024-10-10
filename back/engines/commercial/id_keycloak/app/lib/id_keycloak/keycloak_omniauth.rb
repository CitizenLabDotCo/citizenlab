# frozen_string_literal: true

module IdKeycloak
  class KeycloakOmniauth < OmniauthMethods::Base
    include KeycloakVerification

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        email: auth.info.email,
        locale: AppConfiguration.instance.closest_locale_to('nb-NO') # No need to get the locale from the provider
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
        identifier: config[:client_id],
        secret: config[:client_secret],
        redirect_uri: "#{configuration.base_backend_uri}/auth/keycloak/callback",

        # NOTE: Cannot use auto discovery as .well-known/openid-configuration is not on the root of the domain
        client_signing_alg: :RS256,
        authorization_endpoint: "#{issuer}/protocol/openid-connect/auth",
        token_endpoint: "#{issuer}/protocol/openid-connect/token",
        introspection_endpoint: "#{issuer}/protocol/openid-connect/token/introspect",
        userinfo_endpoint: "#{issuer}/protocol/openid-connect/userinfo",
        jwks_uri: "#{issuer}/protocol/openid-connect/certs"
      }
    end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(auth)
      # Response will tell us if the email is verified
      auth&.info&.email_verified
    end

    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h.delete(:credentials) }
    end

    def issuer
      "https://#{config[:domain]}/auth/realms/idporten"
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
