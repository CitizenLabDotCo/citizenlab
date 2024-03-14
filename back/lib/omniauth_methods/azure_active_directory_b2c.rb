# frozen_string_literal: true

module OmniauthMethods
  class AzureActiveDirectoryB2c < OmniauthMethods::Base
    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      # return unless configuration.feature_activated?('azure_ad_login')

      options = env['omniauth.strategy'].options

      # options[:client_id] = configuration.settings('azure_ad_login', 'client_id')
      # options[:tenant] = configuration.settings('azure_ad_login', 'tenant')

      # options[:discovery] = true

      options[:response_type] = 'code'
      options[:state] = true
      options[:nonce] = true
      options[:scope] = %i[openid]
      # options[:send_scope_to_token_endpoint] = false
      options[:issuer] = 'https://citizenlabdevdemo.b2clogin.com/citizenlabdevdemo.onmicrosoft.com/B2C_1_default_signup_signin_flow/'
      # options[:issuer] = 'https://citizenlabdevdemo.b2clogin.com/citizenlabdevdemo.onmicrosoft.com/B2C_1_default_signup_signin_flow/v2.0/'
      options[:client_options] = {
        identifier: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_CLIENT_ID'),
        secret: ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_CLIENT_SECRET'),
        port: 443,
        scheme: 'https',
        host: 'citizenlabdevdemo.b2clogin.com',
        redirect_uri: "#{configuration.base_backend_uri}/auth/azure_activedirectory_b2c/callback",

        # try to tell OIDC gem to use only id_token
        # try to configure userinfo_endpoint
        # try to make Azure return token
        authorization_endpoint: '/citizenlabdevdemo.onmicrosoft.com/b2c_1_default_signup_signin_flow/oauth2/v2.0/authorize',
        token_endpoint: '/citizenlabdevdemo.onmicrosoft.com/b2c_1_default_signup_signin_flow/oauth2/v2.0/token',
        # userinfo_endpoint: '/openid/userinfo',
        jwks_uri: '/citizenlabdevdemo.onmicrosoft.com/b2c_1_default_signup_signin_flow/discovery/v2.0/keys'
      }
    end

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info['first_name'],
        last_name: auth.info['last_name'],
        email: auth.info['email'],
        remote_avatar_url: remote_avatar_url(auth),
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale)
      }
    end

    private

    def remote_avatar_url(auth)
      return unless AppConfiguration.instance.feature_activated?('user_avatars')

      auth.info['image']
    end
  end

  def updateable_user_attrs
    [:remote_avatar_url]
  end
end
