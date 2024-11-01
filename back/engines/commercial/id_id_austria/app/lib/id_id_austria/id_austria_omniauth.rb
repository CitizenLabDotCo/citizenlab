# frozen_string_literal: true

module IdIdAustria
  class IdAustriaOmniauth < OmniauthMethods::Base
    include IdAustriaVerification

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        email: auth.info.email,
        locale: AppConfiguration.instance.closest_locale_to('de-DE')
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      # NOTE: OmniAuth::Strategies::OpenIDConnect has been monkey patched especially for this Auth method
      # Why? Gem does not support OpenID Connect without a userinfo endpoint

      options = env['omniauth.strategy'].options
      options[:scope] = %i[openid profile]

      # TODO: Can we turn back on auto discovery?
      # it should get configuration from the default https://eid.oesterreich.gv.at/.well-known/openid-configuration
      # options[:discovery] = true

      options[:response_type] = :code # does this mean no userinfo_endpoint? TODO: Try monkey patching the gem
      options[:issuer] = issuer
      options[:client_auth_method] = 'jwks' # added because of invalid_grant :: Invalid grant
      options[:client_signing_alg] = :RS256
      options[:require_state] = true
      options[:response_type] = :code
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        scheme: 'https',
        host: host,
        port: 443,
        redirect_uri: "#{configuration.base_backend_uri}/auth/id_austria/callback",
        authorization_endpoint: "#{issuer}/auth/idp/profile/oidc/authorize",
        token_endpoint: "#{issuer}/auth/idp/profile/oidc/token",
        jwks_uri: "#{issuer}/auth/idp/profile/oidc/keyset"
      }
    end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(auth)
      # Even if the response says the email is NOT verified, we assume that it is if email is present
      auth&.info&.email.present?
    end

    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h.delete(:credentials) }
    end

    private

    def host
      'eid.oesterreich.gv.at' # Test and production are both on the same host
    end

    def issuer
      "https://#{host}"
    end
  end
end
