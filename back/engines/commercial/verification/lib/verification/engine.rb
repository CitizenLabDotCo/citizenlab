require 'verification/smart_groups/rules/verified'

module Verification
  class Engine < ::Rails::Engine
    isolate_namespace Verification

    config.to_prepare do
      if defined? ::SmartGroups::RulesService
        ::SmartGroups::RulesService.add_rule(::Verification::SmartGroups::Rules::Verified)
      end
    end
  end
end
