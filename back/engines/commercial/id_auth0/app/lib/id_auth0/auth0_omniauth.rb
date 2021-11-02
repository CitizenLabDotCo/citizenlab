# frozen_string_literal: true

module IdAuth0
  class Auth0Omniauth

    include Auth0Verification

    def profile_to_user_attrs(auth)
      {}
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(configuration, env)
      if Verification::VerificationService.new.is_active?(configuration, name)
        options = env['omniauth.strategy'].options
        options[:client_id] = config[:client_id]
        options[:client_secret] = config[:client_secret]
        options[:domain] = config[:domain]
        options[:authorize_params] = {
          scope: 'openid'
        }
      end
    end

    def updateable_user_attrs
      []
    end

  end

end