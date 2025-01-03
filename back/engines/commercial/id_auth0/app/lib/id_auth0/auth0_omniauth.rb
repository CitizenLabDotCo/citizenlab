# frozen_string_literal: true

module IdAuth0
  class Auth0Omniauth < IdMethod::Base
    include IdMethod::OmniAuthMethod
    include Auth0Verification

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
