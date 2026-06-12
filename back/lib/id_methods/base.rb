# frozen_string_literal: true

module IdMethods
  class Base
    def name
      raise NotImplementedError
    end

    # Whether this method can be used to verify user identities.
    def verification?
      raise NotImplementedError
    end

    # Whether this method can be used for authentication
    # (i.e. sign up and log in with SSO)
    def authentication?
      raise NotImplementedError
    end

    # @param [AppConfiguration] configuration
    def omniauth_setup(_configuration, _env)
      raise 'Subclass must implement this method'
    end

    # Public method, does not get overridden in practice.
    # @return [Hash, nil]
    def config
      (AppConfiguration.instance.settings('id_config', 'id_methods') || [])
        .find { |method| method['name'] == name }
        .to_h # if find returns nil
        .except('allowed', 'enabled')
        .symbolize_keys
        .presence
    end

    # It allows to migrate from one provider to another. See how it's overridden.
    def name_for_hashing
      name
    end

    def enabled_for_verified_actions?
      return false if config.nil?

      config[:enabled_for_verified_actions] || false
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

    def email_confirmed?(_auth)
      # TODO: (Luuc): should we set this to be auth.extra.raw_info.email_verified? by default?
      true
    end

    def enforced_email_domains
      []
    end
  end
end
