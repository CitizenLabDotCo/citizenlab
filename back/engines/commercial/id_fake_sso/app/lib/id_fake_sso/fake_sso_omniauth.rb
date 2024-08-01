# frozen_string_literal: true

module IdFakeSso
  class FakeSsoOmniauth < OmniauthMethods::Base
    include FakeSsoVerification

    def profile_to_user_attrs(auth)
      {
        first_name: auth.info['first_name'],
        email: auth.info['email'],
        last_name: auth.info['last_name'],
        gender: auth.extra.raw_info['gender'],
        birthyear: Date.parse(auth.extra.raw_info['birthdate']).year
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless configuration.feature_activated?('fake_sso')

      options = env['omniauth.strategy'].options

      # No idea why we need to do this but otherwise
      # the omniauth_openid_connect gem
      # will start complaining that our nonce does not match
      session = env['rack.session']
      session['omniauth.nonce'] = nil

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

    def verification_prioritized?
      true
    end

    def email_always_present?
      false
    end

    def email_confirmed?(auth)
      auth.info['email_verified']
    end

    def jwt_secret_base64
      Base64.encode64('cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2')
    end
  end
end
