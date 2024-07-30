# frozen_string_literal: true

module IdIdAustria
  class IdAustriaOmniauth < OmniauthMethods::Base
    include IdAustriaVerification

    def profile_to_user_attrs(auth)
      custom_field_values = {}

      # Handle birthdate
      # birthdate is already in YYYY-MM-DD
      # TODO: JS - add in all the fields that are useful to us
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

      first_name, *last_name = auth.extra.raw_info.name.split
      {
        first_name: first_name,
        last_name: last_name.join(' '),
        locale: AppConfiguration.instance.closest_locale_to('de-DE'),
        custom_field_values: custom_field_values
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options

      options[:scope] = %i[openid profile]

      # it should get configuration from the default https://eid2.oesterreich.gv.at/.well-known/openid-configuration
      options[:discovery] = true

      options[:response_type] = :code
      # options[:acr_values] = acr_values # TODO: JS - check if needed
      options[:issuer] = issuer
      # binding.pry
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        scheme: 'https',
        host: host,
        port: 443,
        redirect_uri: "#{configuration.base_backend_uri}/auth/id_austria/callback"
      }
    end

    def email_always_present?
      false # TODO: JS - check if email is always returned?
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(_auth)
      true
    end

    def filter_auth_to_persist(_auth)
      # Atm we use `auth_hash` in one place.
      # It can be useful in some other cases too back/lib/tasks/single_use/20240125_convert_vienna_uid_to_userid.rake
      # But some providers send us too sensitive information (SSN, address), so we cannot always store `auth_hash`.
      nil
    end

    def logout_url(_user)
      # TODO: JS - is there a logout URL? Or can we remove completely?
      # We don't need to logout from IdAustria, we set this URL only to refresh UI on our side.
      # Otherwise, the "Sign up" modal is shown after signout.
      # Steps to reproduce:
      # 1. Sign up with IdAustria
      # 2. Sign out without entering email
      #
      # TODO: do it on FE.
      Frontend::UrlService.new.home_url
    end

    def host
      case AppConfiguration.instance.settings('id_austria', 'environment')
      when 'test'
        'eid2.oesterreich.gv.at'
      when 'production'
        'eid.oesterreich.gv.at'
      end
    end

    def issuer
      "https://#{host}"
    end

    # private

    # def acr_values
    #   case config[:identity_source]
    #   when DK_MIT_ID
    #     'urn:grn:authn:dk:mitid:substantial'
    #   else
    #     raise "Unsupported identity source #{config[:identity_source]}"
    #   end
    # end
  end
end
