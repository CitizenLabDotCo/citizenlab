# frozen_string_literal: true

module CustomIdMethods::EtatLu
  class EtatLuOmniauth < OmniauthMethods::Base
    include EtatLuVerification

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
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options
      options[:scope] = %i[openid email profile]
      options[:response_type] = :code
      options[:discovery] = true
      options[:issuer] = issuer
      options[:client_options] = {
        identifier: config[:client_id],
        secret: config[:client_secret],
        redirect_uri: "#{configuration.base_backend_uri}/auth/etat_lu/callback"
      }
    end

    def email_always_present?
      true
    end

    def verification_prioritized?
      true
    end

    def email_confirmed?(auth)
      auth&.info&.email.present?
    end

    def filter_auth_to_persist(auth)
      auth_to_persist = auth.deep_dup
      auth_to_persist.tap { |h| h.delete(:credentials) }
    end

    def issuer
      config[:issuer]
    end

    def updateable_user_attrs
      super + %i[first_name last_name]
    end
  end
end
