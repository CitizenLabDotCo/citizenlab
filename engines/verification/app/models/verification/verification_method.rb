module Verification
  module VerificationMethod

    def config
      current_config_parameters = Tenant
        .settings('verification', 'verification_methods')
        .find{|vm| vm['name'] == name}
      current_config_parameters&.except("allowed", "enabled")&.symbolize_keys
    end
  end
end