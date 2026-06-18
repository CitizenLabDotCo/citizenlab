# frozen_string_literal: true

module CustomIdMethods::FakeSso
  class FakeSsoOmniauth < IdMethods::Base
    include FakeSsoVerification

    def name
      'fake_sso'
    end

    def verification?
      true
    end

    def authentication?
      true
    end

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
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options

      # No idea why we need to do this but otherwise
      # the omniauth_openid_connect gem
      # will start complaining that our nonce does not match
      session = env['rack.session']
      session['omniauth.nonce'] = nil

      options[:issuer] = issuer
      options[:jwt_secret_base64] = jwt_secret_base64 if jwt_secret_base64
      options[:client_options] = {
        identifier: 'govocal_client',
        secret: 'abc123',
        port: port,
        scheme: scheme,
        host: host,
        redirect_uri: "#{configuration.base_backend_uri}/auth/fake_sso/callback"
      }
    end

    def host
      URI.parse(issuer).host
    end

    def issuer
      return issuer_in_settings if issuer_in_settings.present?

      'http://host.docker.internal'
    end

    def port
      return 443 if issuer_in_settings.present?

      8081
    end

    def scheme
      return 'https' if issuer_in_settings.present?

      'http'
    end

    def email_always_present?
      false
    end

    def email_confirmed?(auth)
      auth.info['email_verified']
    end

    # The fake SSO JWT secret is only needed to verify ID tokens against a real
    # Fake SSO service. It is not set in every environment (e.g. CI), so a
    # missing value must not raise and break the omniauth flow.
    def jwt_secret_base64
      secret = ENV.fetch('FAKE_SSO_JWT_SECRET', nil)
      Base64.encode64(secret) if secret.present?
    end

    def issuer_in_settings
      @issuer_in_settings ||= config&.dig(:issuer)
    end
  end
end
