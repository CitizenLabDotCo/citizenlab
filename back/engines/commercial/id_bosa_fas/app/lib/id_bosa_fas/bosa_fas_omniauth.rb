# frozen_string_literal: true

module IdBosaFas
  class BosaFasOmniauth < IdMethod::Base
    include IdMethod::OmniAuthMethod
    include BosaFasVerification

    ENVIRONMENTS = {
      'integration' => {
        host: 'idp.iamfas.int.belgium.be',
        jwks_uri: 'https://idp.iamfas.int.belgium.be/fas/oauth2/connect/jwk_uri'
      },
      'production' => {
        host: 'idp.iamfas.belgium.be',
        jwks_uri: 'https://idp.iamfas.belgium.be/fas/oauth2/connect/jwk_uri'
      }
    }

    def auth?
      false # Although using omni_auth, this is not yet enabled as an SSO method
    end

    def profile_to_user_attrs(auth)
      {}.tap do |info|
        info[:first_name] = auth.dig('extra', 'raw_info', 'givenName') if auth.dig('extra', 'raw_info', 'givenName')
        info[:last_name] = auth.dig('extra', 'raw_info', 'surname') if auth.dig('extra', 'raw_info', 'surname')
      end
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options
      options[:scope] = %i[openid profile egovnrn]
      options[:response_type] = :code
      options[:state] = true
      options[:nonce] = true
      options[:issuer] = "https://#{host}/fas/oauth2"
      options[:acr_values] = 'urn:be:fedict:iam:fas:Level450'
      options[:send_scope_to_token_endpoint] = false
      options[:client_signing_alg] = :RS256
      options[:client_jwk_signing_key] = jwks
      options[:client_options] = {
        identifier: config[:identifier],
        secret: config[:secret],
        port: 443,
        scheme: 'https',
        host: host,
        authorization_endpoint: '/fas/oauth2/authorize',
        token_endpoint: '/fas/oauth2/access_token',
        userinfo_endpoint: '/fas/oauth2/userinfo',
        redirect_uri: "#{configuration.base_backend_uri}/auth/bosa_fas/callback"
      }
    end

    def host
      ENVIRONMENTS.fetch(config[:environment]).fetch(:host)
    end

    def jwks_uri
      ENVIRONMENTS.fetch(config[:environment]).fetch(:jwks_uri)
    end

    # Returns the JSON Web Key Set (JWKS) that can be used to validate JSON tokens
    # issued by BOSA FAS.
    def jwks
      @jwks ||= URI.parse(jwks_uri).read
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
