module OmniauthMethods
  class Base
    # @param [AppConfiguration] configuration
    def omniauth_setup(_configuration, _env)
      raise 'Subclass must implement this method'
    end

    # Extracts user attributes from the Omniauth response auth.
    # @param [OmniAuth::AuthHash] auth
    # @return [Hash] The user attributes
    def profile_to_user_attrs(_auth)
      {}
    end

    # @return [Array<Symbol>] Returns a list of user attributes that can be updated from the auth response hash
    def updateable_user_attrs
      []
    end

    # @return [Boolean] If existing user attributes should be overwritten
    def overwrite_user_attrs?
      true
    end
  end
end
