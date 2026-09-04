# frozen_string_literal: true

module CustomIdMethods::Acm
  class AcmOmniauth < IdMethods::Base
    include AcmVerification

    def name
      'acm'
    end

    def verification?
      true
    end

    def authentication?
      true
    end

    def profile_to_user_attrs(auth)
      # Check the RRN (WijkBudget API or MAGDA, see AcmVerification#rrn_check) and store the
      # result in a select custom field with options: [valid, lives_outside, under_minimum_age, no_match, service_error]
      custom_field_values = {}
      if (rrn_result_key = config[:rrn_result_custom_field_key]).present? && (check = rrn_check(auth))
        custom_field_values[rrn_result_key] = check['result']
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
