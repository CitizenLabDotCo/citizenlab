# frozen_string_literal: true

module IdMethod
  module OmniAuthMethod
    def auth?
      true
    end

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

    def profile_to_uid(auth)
      auth['uid']
    end

    def filter_auth_to_persist(auth)
      auth
    end

    # @return [Array<Symbol>] Returns a list of user attributes that can be updated from the auth response hash
    def updateable_user_attrs
      result = []
      # If password_login is disabled, users cannot update their emails on UI,
      # but we still want to keep their emails up to date.
      result << :email if !AppConfiguration.instance.feature_activated?('password_login')
      result
    end

    def can_merge?(_user, _user_attrs, _sso_verification_param_value)
      true
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

    def email_confirmed?(_auth)
      true
    end
  end
end
