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

      options[:response_type] = 'id_token'
      options[:response_mode] = 'form_post'
      options[:state] = true
      options[:nonce] = true
      options[:scope] = %i[openid]
      # options[:send_scope_to_token_endpoint] = false
      # Configured in Azure AD B2C -> Select the user flow -> Settings -> Properties -> Token compatibility settings
      options[:issuer] = "https://citizenlabdevdemo.b2clogin.com/#{ENV.fetch('DEFAULT_AZURE_AD_B2C_LOGIN_TENANT_ID')}/v2.0/"
      # options[:issuer] = 'https://citizenlabdevdemo.b2clogin.com/citizenlabdevdemo.onmicrosoft.com/B2C_1_default_signup_signin_flow/v2.0/'
      options[:client_options] = {
        # do we need ID and secret if we use form_post?
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

        # has to have the origin
        jwks_uri: 'https://citizenlabdevdemo.b2clogin.com/citizenlabdevdemo.onmicrosoft.com/b2c_1_default_signup_signin_flow/discovery/v2.0/keys'
      }
    end

    def profile_to_user_attrs(auth)
      raw_info = auth.extra.raw_info
      {
        first_name: raw_info['given_name'],
        last_name: raw_info['family_name'],
        email: raw_info['emails'].first,
        locale: AppConfiguration.instance.settings('core', 'locales').first
      }
    end
  end
end
