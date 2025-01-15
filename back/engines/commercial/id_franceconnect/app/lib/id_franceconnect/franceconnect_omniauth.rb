# frozen_string_literal: true

# FranceConnect works locally with any of these identifiers
# https://github.com/france-connect/identity-provider-example/blob/master/database.csv
module IdFranceconnect
  class FranceconnectOmniauth < IdMethod::Base
    include IdMethod::OmniAuthMethod
    include FranceconnectVerification

    # The flow of the sso_verification param in case of FranceConnect:
    # 1. FE sends request to BE /auth/franceconnect?token=...&verification_pathname=...&sso_verification=true
    #    (see front/app/modules/commercial/id_franceconnect/components/VerificationFranceConnectButton.tsx:32)
    # 2. The request is processed by a Rack middleware (configured in id_franceconnect/config/initializers/omniauth.rb),
    #    that calls IdFranceconnect::FranceconnectOmniauth#omniauth_setup and redirects browser to FranceConnect.
    #    Redirect data contains IdFranceconnect::FranceconnectOmniauth#redirect_uri (points to OmniauthCallbackController)
    #    with sso_verification=true
    # 3. In the end of FranceConnect authentication, browser is redirected to this #redirect_uri
    # 4. OmniauthCallbackController processes the request and so #create and #auth_callback have access to sso_verification=true in parameters
    #
    SSO_VERIFICATION_PARAM_NAME = 'sso_verification'
    SSO_VERIFICATION_PARAM_VALUE = 'true'

    def profile_to_user_attrs(auth)
      # TODO: Do something smart with the address auth.extra.raw_info.address.formatted
      {
        first_name: auth.info['first_name'],
        email: auth.info['email'],
        last_name: auth.info['last_name']&.titleize, # FC returns last names in ALL CAPITALS
        locale: AppConfiguration.instance.closest_locale_to('fr-FR'),
        remote_avatar_url: auth.info['image']
      }.tap do |attrs|
        custom_fields = CustomField.registration.enabled.pluck(:code)
        if custom_fields.include?('birthyear')
          birthdate = auth.extra.raw_info.birthdate
          attrs[:birthyear] = Date.parse(birthdate).year if birthdate.present?
        end
        if custom_fields.include?('gender')
          attrs[:gender] = auth.extra.raw_info.gender
        end
      end
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('franceconnect_login')

      env['omniauth.strategy'].options.merge!(
        scope: %w[openid] + configuration.settings('franceconnect_login', 'scope'),
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
          redirect_uri: redirect_uri(configuration, env),
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
      when 'integration'
        'fcp.integ01.dev-franceconnect.fr'
      when 'production'
        'app.franceconnect.gouv.fr'
      end
    end

    def issuer
      "https://#{host}"
    end

    def updateable_user_attrs
      super + %i[first_name last_name birthyear gender remote_avatar_url]
    end

    # To make this method return false and so to reproduce merging error, you need:
    # 1. Sign up with FranceConnect using the user with email wossewodda-3728@yopmail.com from this table
    #    https://github.com/france-connect/identity-provider-example/blob/master/database.csv
    #    (in FranceConnect window you can choose "Demonstration eIDAS substantiel").
    # 2. Change user's name and remove all connections with FranceConnect like that
    #    User.find_by(email: 'wossewodda-3728@yopmail.com').update!(first_name: 'A', last_name: 'B', password: 'democracy2.0', verified: false, identities: [], verifications: [])
    # 3. If you try to verify or sign in or sign up with FranceConnect again, you'll see the merging error.
    #
    def can_merge?(user, user_attrs, sso_verification_param_value)
      # We always merge during verification (not authentication) regardless of other attributes.
      return true if sso_verification_param_value == SSO_VERIFICATION_PARAM_VALUE

      matcher = IdFranceconnect::AttributesMatcher

      matcher.match?(user.first_name, user_attrs[:first_name]) ||
        matcher.match?(user.last_name, user_attrs[:last_name])
    end

    def merging_error_code
      'franceconnect_merging_failed'
    end

    def verification_prioritized?
      false
    end

    private

    # @param [AppConfiguration] configuration
    def redirect_uri(configuration, env)
      result = "#{configuration.base_backend_uri}/auth/franceconnect/callback"

      if env.dig('rack.request.query_hash', SSO_VERIFICATION_PARAM_NAME) == SSO_VERIFICATION_PARAM_VALUE
        result += "?#{SSO_VERIFICATION_PARAM_NAME}=#{SSO_VERIFICATION_PARAM_VALUE}"
      end

      result
    end
  end
end
