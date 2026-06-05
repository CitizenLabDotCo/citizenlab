# frozen_string_literal: true

module CustomIdMethods::Auth0
  class Auth0Omniauth < IdMethods::Base
    include Auth0Verification

    def name
      'auth0'
    end

    def verification?
      true
    end

    def authentication?
      false
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      return unless Verification::VerificationService.new.active?(configuration, name)

      options = env['omniauth.strategy'].options
      options[:client_id] = config[:client_id]
      options[:client_secret] = config[:client_secret]
      options[:domain] = config[:domain]
      options[:authorize_params] = {
        scope: 'openid'
      }
    end
  end
end
