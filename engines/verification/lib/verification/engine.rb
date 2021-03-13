module Verification
  class Engine < ::Rails::Engine
    isolate_namespace Verification

    config.to_prepare do
      if defined? ::SmartGroups::RulesService
        require 'verification/smart_groups/rules/verified'
        ::SmartGroups::RulesService.add_rule(SmartGroups::Rules::Verified)
      end
    end
  end
end
