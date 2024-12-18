# frozen_string_literal: true

module IdMethod
  module VerificationMethod
    def verification_method?
      true
    end
    # It allows to migrate from one provider to another. See how it's overridden.
    def name_for_hashing
      name
    end

    def name
      nil
    end

    # @return [Hash, nil]
    def config
      AppConfiguration.instance
        .settings('verification', 'verification_methods')
        .find { |method| method['name'] == name }
        .to_h # if find returns nil
        .except('allowed', 'enabled')
        .symbolize_keys
        .presence
    end

    def enabled_for_verified_actions?
      config[:enabled_for_verified_actions] || false
    end
  end
end
