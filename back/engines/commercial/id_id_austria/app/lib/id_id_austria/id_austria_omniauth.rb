# frozen_string_literal: true

module IdIdAustria
  class IdAustriaOmniauth < OmniauthMethods::Base
    include IdAustriaVerification

    def profile_to_user_attrs(auth)
      first_name, *last_name = auth.extra.raw_info.name.split
      {
        first_name: first_name,
        last_name: last_name.join(' '),
        locale: AppConfiguration.instance.closest_locale_to('de-DE'),
      }
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options

      options[:scope] = %i[openid profile]

      # it should get configuration from the default https://eid2.oesterreich.gv.at/.well-known/openid-configuration
      options[:discovery] = true

      options[:response_type] = :code
      # options[:acr_values] = acr_values # TODO: JS - check if needed
      options[:issuer] = issuer
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        scheme: 'https',
        host: host,
        port: 443,
        redirect_uri: "#{configuration.base_backend_uri}/auth/id_austria/callback"
      }
    end

    def email_always_present?
      false # TODO: JS - check if email is returned?
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(_auth)
      true
    end

    def filter_auth_to_persist(_auth)
      # TODO: JS - Can we store the auth hash? Would be useful for debugging.
      nil
    end

    private

    def host
      env = config['environment']
      return 'eid.oesterreich.gv.at' if env == 'production'

      'eid2.oesterreich.gv.at' # Test env
    end

    def issuer
      "https://#{host}"
    end

    # def acr_values
    #   case config[:identity_source]
    #   when DK_MIT_ID
    #     'urn:grn:authn:dk:mitid:substantial'
    #   else
    #     raise "Unsupported identity source #{config[:identity_source]}"
    #   end
    # end
  end
end
