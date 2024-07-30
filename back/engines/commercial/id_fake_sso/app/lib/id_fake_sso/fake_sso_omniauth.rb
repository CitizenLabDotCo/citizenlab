# frozen_string_literal: true

module IdFakeSso
  class FakeSsoOmniauth < OmniauthMethods::Base
    def profile_to_user_attrs(auth)
      # TODO
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, _env)
      # TODO
      options = env['omniauth.strategy'].options

      options[:client_options] = {
        identifier: feature['client_id'],
        secret: feature['client_secret'],
        port: 8081,
        scheme: 'http',
        host: host,
        redirect_uri: "#{configuration.base_backend_uri}/auth/fake_sso/callback"
      }
    end

    def host
      # TODO
      'localhost'
    end

    def issuer
      # TODO
      "http://#{host}/"
    end

    def updateable_user_attrs
      # TODO
    end

    def locked_custom_fields
      # TODO
    end

    def email_confirmed?(auth)
      # TODO
    end
  end
end
