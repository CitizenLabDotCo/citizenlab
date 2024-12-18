# frozen_string_literal: true

module OmniauthMethods
  class AzureActiveDirectoryB2c < IdMethod::Base
    include IdMethod::OmniAuthMethod
    # Azure AD B2C endpoints are specific to the user flow ("policy") that an application wishes to use to authenticate users.
    # The endpoints can be found in "Azure AD B2C | App registrations" -> Endpoints.
    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('azure_ad_b2c_login')

      feature = configuration.settings('azure_ad_b2c_login')

      options = env['omniauth.strategy'].options

      # Fetches config from #{issuer}/.well-known/openid-configuration
      options[:discovery] = true

      options[:response_type] = 'id_token'
      options[:response_mode] = 'form_post'
      options[:state] = true
      options[:nonce] = true
      options[:send_scope_to_token_endpoint] = false
      options[:scope] = %i[openid]

      # options[:issuer] = "https://citizenlabdevdemo.b2clogin.com/#{TENANT_ID}/v2.0/" # default, but works only with manually configured endpoints. Discovery returns 404 because it's not 100% compatible with OIDC spec.
      # So, the issuer should be configured in Azure AD B2C -> Select the user flow -> Settings -> Properties -> Token compatibility settings

      # options[:issuer] = "https://citizenlabdevdemo.b2clogin.com/#{TENANT_ID}/B2C_1_default_signup_signin_flow/v2.0/" # During discovery, it gives "Issuer mismatch" error
      # options[:issuer] = 'https://citizenlabdevdemo.b2clogin.com/citizenlabdevdemo.onmicrosoft.com/B2C_1_default_signup_signin_flow/v2.0/' # tenant domain name can be used instead of tenant id, but it doesn't work with tfp

      tenant_name = feature['tenant_name']
      tenant_id   = feature['tenant_id']
      policy_name = feature['policy_name'].downcase
      options[:issuer] = "https://#{tenant_name}.b2clogin.com/tfp/#{tenant_id}/#{policy_name}/v2.0/"

      options[:client_options] = {
        # We don't need secret if we use form_post
        identifier: configuration.settings('azure_ad_b2c_login', 'client_id'),
        port: 443,
        scheme: 'https',
        host: "#{tenant_name}.b2clogin.com",
        redirect_uri: "#{configuration.base_backend_uri}/auth/azureactivedirectory_b2c/callback"
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
