# frozen_string_literal: true

module IdKeycloak
  class KeycloakOmniauth < OmniauthMethods::Base
    include KeycloakVerification

    def profile_to_user_attrs(auth)
      first_name, *last_name = auth.info.name.split
      email = auth.info.email
      {
        first_name: first_name,
        last_name: last_name.join(' '),
        email: email,
        locale: AppConfiguration.instance.closest_locale_to('nb-NO'), # No need to get the locale from the provider
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options

      # Here we assume Criipto is configured to use a 'static scope'. In the UI,
      # in August 2023, the `Enable dynamic scopes` toggle in the `General` tab
      # of the application needs to be turned off.
      # More info here: https://docs.criipto.com/verify/getting-started/oidc-intro/#the-scope-parameter
      options[:scope] = %i[openid]

      # it gets configuration from the default https://your.criipto.domain/.well-known/openid-configuration
      options[:discovery] = true

      options[:response_type] = :code
      options[:acr_values] = acr_values
      options[:issuer] = issuer
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        host: config[:domain],
        redirect_uri: "#{configuration.base_backend_uri}/auth/keycloak/callback"
      }
    end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(auth)
      # Assume email confirmed if present
      auth.info.email.present?
    end

    def filter_auth_to_persist(_auth)
      # Atm we use `auth_hash` in one place.
      # It can be useful in some other cases too back/lib/tasks/single_use/20240125_convert_vienna_uid_to_userid.rake
      # But some providers send us too sensitive information (SSN, address), so we cannot always store `auth_hash`.
      nil
    end

    def logout_url(_user)
      # We don't need to logout from Criipto, we set this URL only to refresh UI on our side.
      # Otherwise, the "Sign up" modal is shown after signout.
      # Steps to reproduce:
      # 1. Sign up with Criipto
      # 2. Sign out without entering email
      #
      # TODO: do it on FE.
      Frontend::UrlService.new.home_url
    end

    def issuer
      "https://#{config[:domain]}"
    end

    private

    # See https://docs.criipto.com/verify/guides/authorize-url-builder/#auth-methods--acr-values
    def acr_values
      'urn:grn:authn:dk:mitid:substantial'
    end
  end
end
