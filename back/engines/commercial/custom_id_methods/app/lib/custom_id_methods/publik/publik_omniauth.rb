# frozen_string_literal: true

# Publik (https://publik.entrouvert.com) is an OIDC provider used by French
# municipalities, each on its own domain, hence the configurable issuer.
module CustomIdMethods::Publik
  class PublikOmniauth < IdMethods::Base
    def name
      'publik'
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
      'd20e0325-f11b-488c-983e-1f3144bf2a42'
    end

    def config_parameters
      %i[issuer client_id client_secret ui_method_name logo_url]
    end

    def config_parameters_schema
      {
        issuer: {
          private: true,
          type: 'string',
          title: 'Issuer',
          description: 'Copy the `issuer` from the provider\'s /.well-known/openid-configuration, trailing slash included.'
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
        },
        ui_method_name: {
          type: 'string',
          title: 'Method name',
          description: 'Name of the login button, e.g. "Connexion Meyzieu". Each city brands Publik as its own.'
        },
        logo_url: {
          title: 'Logo',
          type: 'string',
          pattern: '^https://.+',
          description: 'The full URL to the logo image that is shown on the authentication button. Logo should be approx. 25px in height.'
        }
      }
    end

    # Read by the frontend to render the login button.
    def exposed_config_parameters
      %i[logo_url]
    end

    def ui_method_name
      config[:ui_method_name].presence || name
    end

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info.first_name,
        last_name: auth.info.last_name,
        email: auth.info.email,
        locale: AppConfiguration.instance.closest_locale_to('fr-FR')
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

    def email_confirmed?(auth)
      auth.info.email_verified
    end

    def filter_auth_to_persist(auth)
      auth.deep_dup.tap { |h| h.delete(:credentials) }
    end
  end
end
