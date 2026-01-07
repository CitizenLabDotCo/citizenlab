# frozen_string_literal: true

module IdAcm
  class AcmOmniauth < OmniauthMethods::Base
    include AcmVerification

    def profile_to_user_attrs(auth)
      # Validate the RRN against the API and store the result in a custom field
      # Custom field should be a select field with options: [valid, lives_outside, under_minimum_age, no_match, service_error]
      custom_field_values = {}
      if (rrn_result_key = config[:rrn_result_custom_field_key])
        rrn_result = rnn_verification_result(auth.extra.raw_info.rrn)
        custom_field_values[rrn_result_key] = rrn_result if rrn_result
      end

      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        email: auth.info.email,
        locale: AppConfiguration.instance.closest_locale_to('nl-BE'),
        custom_field_values: custom_field_values
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options
      options[:discovery] = true
      options[:scope] = %i[openid profile email rrn]
      options[:response_type] = :code
      options[:issuer] = issuer
      options[:client_options] = {
        scheme: 'https',
        host: host,
        identifier: config[:client_id],
        secret: config[:client_secret],
        redirect_uri: "#{configuration.base_backend_uri}/auth/acm/callback"
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

    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h.delete(:credentials) }
    end

    def host
      config[:domain]
    end

    def issuer
      "https://#{host}/op"
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
