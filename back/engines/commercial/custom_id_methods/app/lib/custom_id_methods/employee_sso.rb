# frozen_string_literal: true

# Shared by the SSO methods that city staff (admins, project managers) sign in
# with: the button can be kept away from residents (visibility), and staff email
# domains can be forced through the SSO instead of a password.
module CustomIdMethods::EmployeeSso
  EMPLOYEE_SSO_CONFIG_PARAMETERS = %i[
    logo_url
    login_mechanism_name
    visibility
    enforced_email_domains
    enforced_email_domain_error_multiloc
  ].freeze

  def employee_only?
    true
  end

  def employee_sso_config_parameters_schema
    {
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
        description: "Comma-separated list of email domains (e.g. 'example.com,company.org'). Users with these email domains must sign in via this method."
      },
      enforced_email_domain_error_multiloc: {
        title: 'Enforce Email Domain Error Message',
        '$ref': '#/definitions/multiloc_string',
        description: 'Custom error message shown to users who must sign in via this method due to their email domain.'
      }
    }
  end

  # Exposed publicly via the /id_methods endpoint so the frontend can
  # render the SSO button (logo, label) and enforce visibility / domain rules.
  def exposed_config_parameters
    %i[logo_url login_mechanism_name visibility enforced_email_domain_error_multiloc]
  end

  def enforced_email_domains
    # Called on every login attempt (via AuthenticationService.new.sso_enforced_for_email?),
    # including on tenants that have no verification configured. Guard before
    # reading #config, which assumes the verification setting is present.
    return [] unless IdMethodService.new.configured?(AppConfiguration.instance, name)

    domains_str = config[:enforced_email_domains]
    return [] if domains_str.blank?

    domains_str.split(',').map { |d| d.strip.downcase }.compact_blank
  end
end
