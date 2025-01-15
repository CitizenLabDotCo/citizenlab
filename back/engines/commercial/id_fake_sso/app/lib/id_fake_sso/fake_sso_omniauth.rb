# frozen_string_literal: true

module IdFakeSso
  class FakeSsoOmniauth
    include IdMethod::OmniAuthMethod
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
      Base64.encode64(ENV.fetch('FAKE_SSO_JWT_SECRET'))
    end

    def issuer_in_settings
      @issuer_in_settings ||= AppConfiguration.instance.settings('fake_sso', 'issuer')
    end
  end
end
