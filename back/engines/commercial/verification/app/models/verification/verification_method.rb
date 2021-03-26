module Verification
  module VerificationMethod

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

  end
end