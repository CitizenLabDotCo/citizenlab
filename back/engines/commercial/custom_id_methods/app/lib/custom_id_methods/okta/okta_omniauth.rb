# frozen_string_literal: true

# Okta (https://www.okta.com) is an OIDC provider that cities use for their
# staff accounts. Each customer has its own Okta domain, hence the configurable
# issuer.
module CustomIdMethods::Okta
  class OktaOmniauth < IdMethods::Base
    include CustomIdMethods::EmployeeSso

    def name
      'okta'
    end

    def verification?
      false
    end

    def authentication?
      true
    end

    def verification_method_type
      :omniauth
    end

    def id
      '3838ec01-d774-4818-a7ec-ac84fd4bbdd3'
    end

    def config_parameters
      %i[issuer client_id client_secret] + EMPLOYEE_SSO_CONFIG_PARAMETERS
    end

    def config_parameters_schema
      {
        issuer: {
          private: true,
          type: 'string',
          title: 'Issuer',
          description: 'Copy the `issuer` from the customer /.well-known/openid-configuration'
        },
        client_id: {
          private: true,
          type: 'string',
          title: 'Client ID'
        },
        client_secret: {
          private: true,
          type: 'string',
          title: 'Client Secret'
        }
      }.merge(employee_sso_config_parameters_schema)
    end

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        email: auth.info.email,
        locale: AppConfiguration.instance.closest_locale_to(language(auth))
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless IdMethodService.new.configured?(configuration, name)

      options = env['omniauth.strategy'].options

      options[:scope] = %i[openid email profile]
      options[:response_type] = :code
      options[:state] = true
      options[:nonce] = true
      options[:discovery] = true
      options[:issuer] = issuer
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        scheme: 'https',
        host: URI.parse(issuer.to_s).host,
        port: 443,
        redirect_uri: "#{configuration.base_backend_uri}/auth/#{name}/callback"
      }
    end

    def issuer
      config[:issuer]
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end

    def filter_auth_to_persist(auth)
      auth.deep_dup.tap { |h| h.delete(:credentials) }
    end

    private

    # Okta sends locales like "en-US" or "en_US", which never match a platform
    # locale such as "en", so only the language part is matched.
    def language(auth)
      auth.extra.raw_info.locale.to_s.split(/[-_]/).first
    end
  end
end
