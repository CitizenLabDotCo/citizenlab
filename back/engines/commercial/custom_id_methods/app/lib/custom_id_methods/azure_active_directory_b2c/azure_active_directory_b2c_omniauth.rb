# frozen_string_literal: true

module CustomIdMethods::AzureActiveDirectoryB2c
  class AzureActiveDirectoryB2cOmniauth < OmniauthMethods::Base
    include Verification::VerificationMethod

    # Azure AD B2C is a login-only SSO method. Its configuration lives alongside
    # the verification methods (in `verification.verification_methods`), but it
    # cannot be used to verify user identities.
    def verification?
      false
    end

    def verification_method_type
      :omniauth
    end

    def id
      '08ac0e90-1a7d-4684-9117-b5cefe907e89'
    end

    def name
      'azureactivedirectory_b2c'
    end

    def config_parameters
      %i[tenant_name tenant_id policy_name client_id logo_url login_mechanism_name]
    end

    def config_parameters_schema
      {
        tenant_name: {
          title: 'Directory (tenant) Name',
          description: "The name of the Azure AD B2C tenant. The first part of the domain name. E.g. in citizenlabdevdemo.onmicrosoft.com, it's citizenlabdevdemo",
          type: 'string',
          private: true
        },
        tenant_id: {
          title: 'Directory (tenant) ID',
          type: 'string',
          private: true
        },
        policy_name: {
          title: 'Policy (User Flow, User Journey) Name',
          description: 'The name of the policy (user flow, user journey) in the Azure AD B2C tenant. This is the policy that is used for sign-in and sign-up. tenant_name, tenant_id, and policy_name are used together to form such configuration URL https://{tenant_name}.b2clogin.com/tfp/{tenant_id}/{policy_name}/v2.0/.well-known/openid-configuration that returns JSON configuration.',
          type: 'string',
          private: true
        },
        client_id: {
          title: 'Application (client) ID',
          description: "Sometimes also called 'application_id'",
          type: 'string',
          private: true
        },
        logo_url: {
          title: 'Logo',
          type: 'string',
          pattern: '^https://.+',
          description: 'The full URL to the logo image that is shown on the authentication button. Logo should be approx. 25px in height.'
        },
        login_mechanism_name: {
          title: 'Login Mechanism Name',
          type: 'string',
          description: 'The Login Mechanism Name is used for user-facing copy. For instance, "Sign up with {login_mechanism_name}.".'
        }
      }
    end

    # Exposed publicly via the /verification_methods endpoint so the frontend can
    # render the SSO button (logo, label).
    def exposed_config_parameters
      %i[logo_url login_mechanism_name]
    end

    # Azure AD B2C endpoints are specific to the user flow ("policy") that an application wishes to use to authenticate users.
    # The endpoints can be found in "Azure AD B2C | App registrations" -> Endpoints.
    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.configured?(configuration, name)

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

      tenant_name = config[:tenant_name]
      tenant_id   = config[:tenant_id]
      policy_name = config[:policy_name].downcase
      options[:issuer] = "https://#{tenant_name}.b2clogin.com/tfp/#{tenant_id}/#{policy_name}/v2.0/"

      options[:client_options] = {
        # We don't need secret if we use form_post
        identifier: config[:client_id],
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
