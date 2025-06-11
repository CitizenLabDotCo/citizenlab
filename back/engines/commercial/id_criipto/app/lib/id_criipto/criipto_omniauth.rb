# frozen_string_literal: true

module IdCriipto
  class CriiptoOmniauth < OmniauthMethods::Base
    include CriiptoVerification

    def profile_to_user_attrs(auth)
      case config[:identity_source]
      when DK_MIT_ID
        custom_field_values = {}

        # Handle birthdate
        # birthdate is already in YYYY-MM-DD, tak Denmark
        birthdate = auth.extra.raw_info['birthdate']
        if (birthday_key = config[:birthday_custom_field_key]) && birthdate
          custom_field_values[birthday_key] = birthdate
        end
        if (birthyear_key = config[:birthyear_custom_field_key]) && birthdate
          custom_field_values[birthyear_key] = Date.parse(birthdate).year
        end

        # Handle municipality_code
        municipality_code = auth.extra.raw_info.dig('address_details', 'municipality_code')
        if (municipality_code_key = config[:municipality_code_custom_field_key]) && municipality_code.present?
          custom_field_values[municipality_code_key] = municipality_code
        end

        # Handle postal_code - requested by Leyre
        postal_code = auth.extra.raw_info.dig('address', 'postal_code')
        if (postal_code_key = config[:postal_code_custom_field_key]) && postal_code.present?
          custom_field_values[postal_code_key] = postal_code
        end

        first_name, *last_name = auth.extra.raw_info.name.split
        {
          first_name: first_name,
          last_name: last_name.join(' '),
          locale: AppConfiguration.instance.closest_locale_to('da-DK'),
          custom_field_values: custom_field_values
        }
      end
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
        redirect_uri: "#{configuration.base_backend_uri}/auth/criipto/callback"
      }
    end

    def email_always_present?
      false
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(_auth)
      false
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
      case config[:identity_source]
      when DK_MIT_ID
        'urn:grn:authn:dk:mitid:substantial'
      else
        raise "Unsupported identity source #{config[:identity_source]}"
      end
    end
  end
end
