# frozen_string_literal: true

module CustomIdMethods::AzureActiveDirectory
  class AzureActiveDirectoryOmniauth < IdMethods::Base
    # Azure AD is a login-only SSO method. Its configuration lives alongside the
    # verification methods (in `verification.verification_methods`), but it cannot
    # be used to verify user identities.
    def verification?
      false
    end

    def verification_method_type
      :omniauth
    end

    def id
      '7a610902-304b-4399-9f9e-da68ff478e86'
    end

    def name
      'azureactivedirectory'
    end

    def config_parameters
      %i[tenant client_id logo_url login_mechanism_name visibility enforced_email_domains enforced_email_domain_error_multiloc]
    end

    def config_parameters_schema
      {
        tenant: {
          title: 'Directory (tenant) ID',
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
        },
        visibility: {
          title: 'Visibility',
          type: 'string',
          enum: %w[show link hide],
          default: 'show',
          description: "Should this login mechanism be shown with other options to everyone, be hidden but available at /sign-in/admin or linked from the login modal via an 'admin options' link?"
        },
        enforced_email_domains: {
          title: 'Enforced Domains',
          type: 'string',
          description: "Comma-separated list of email domains (e.g. 'example.com,company.org'). Users with these email domains must sign in via Azure AD."
        },
        enforced_email_domain_error_multiloc: {
          title: 'Enforce Email Domain Error Message',
          '$ref': '#/definitions/multiloc_string',
          description: 'Custom error message shown to users who must sign in via Azure AD due to their email domain.'
        }
      }
    end

    # Exposed publicly via the /verification_methods endpoint so the frontend can
    # render the SSO button (logo, label) and enforce visibility / domain rules.
    def exposed_config_parameters
      %i[logo_url login_mechanism_name visibility enforced_email_domain_error_multiloc]
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless IdMethodService.new.configured?(configuration, name)

      env['omniauth.strategy'].options[:client_id] = config[:client_id]
      env['omniauth.strategy'].options[:tenant] = config[:tenant]
    end

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info['first_name'].presence || auth.info['name'],
        last_name: auth.info['last_name'].presence || auth.info['name'],
        email: auth.info['email'].presence,
        remote_avatar_url: remote_avatar_url(auth),
        locale: AppConfiguration.instance.closest_locale_to(auth.extra.raw_info.locale)
      }
    end

    def enforced_email_domains
      # Called on every login attempt (via AuthenticationService.sso_enforced_for_email?),
      # including on tenants that have no verification configured. Guard before
      # reading #config, which assumes the verification setting is present.
      return [] unless IdMethodService.new.configured?(AppConfiguration.instance, name)

      domains_str = config[:enforced_email_domains]
      return [] if domains_str.blank?

      domains_str.split(',').map { |d| d.strip.downcase }.compact_blank
    end

    def email_always_present?
      false
    end

    def updateable_user_attrs
      super + %i[remote_avatar_url]
    end

    private

    def remote_avatar_url(auth)
      return unless AppConfiguration.instance.feature_activated?('user_avatars')

      auth.info['image']
    end
  end
end
