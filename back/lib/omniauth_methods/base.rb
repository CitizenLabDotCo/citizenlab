# frozen_string_literal: true

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

    def can_merge?(_user, _user_attrs, _sso_verification_param_value)
      true
    end

    def redirect_callback_to_get_cookies(_controller)
      false
    end

    # It never runs if #can_merge? always returns true.
    # So, override only if you need to override #can_merge?
    def merging_error_code
      raise NotImplementedError
    end

    def email_always_present?
      true
    end

    def verification_prioritized?
      raise NotImplementedError
    end
  end
end
