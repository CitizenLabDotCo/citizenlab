# frozen_string_literal: true

module IdFakeSso
  class FakeSsoOmniauth < OmniauthMethods::Base
    def profile_to_user_attrs(_auth)
      # TODO
      {
        email: 'test@henk.com'
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      # TODO
      options = env['omniauth.strategy'].options

      options[:issuer] = issuer
      options[:jwt_secret_base64] = jwt_secret_base64
      options[:client_options] = {
        identifier: 'govocal_client',
        secret: 'abc123',
        port: 8081,
        scheme: 'http',
        host: host,
        redirect_uri: "#{configuration.base_backend_uri}/auth/fake_sso/callback"
      }
    end

    def host
      'host.docker.internal'
    end

    def issuer
      "http://#{host}"
    end

    # def updateable_user_attrs
    # TODO
    # end

    def locked_custom_fields
      # TODO
    end

    def email_confirmed?(_auth)
      true
    end

    def jwt_secret_base64
      Base64.encode64('cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2')
    end
  end
end
