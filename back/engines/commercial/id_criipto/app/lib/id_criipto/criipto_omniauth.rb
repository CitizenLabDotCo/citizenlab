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
          custom_field_values[birthyear_key] = Time.new(birthdate).year
        end

        # Handle municipality_code
        municipality_code = auth.extra.raw_info.dig('address_details', 'municipality_code')
        if (municipality_code_key = config[:municipality_code_custom_field_key]) && municipality_code.present?
          custom_field_values[municipality_code_key] = municipality_code
        end

        {
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
      options[:issuer] = "https://#{config[:domain]}"
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        host: config[:domain],
        redirect_uri: "#{configuration.base_backend_uri}/auth/criipto/callback"
      }
    end

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
