module SmartGroups
  module Patches
    module Permission
      def participation_conditions
        service = SmartGroups::RulesService.new

        not_verified_rule = ->(rule) { rule['ruleType'] != 'verified' }
        parse_rule_json   = ->(rule) { service.parse_json_rule(rule) }

        rules = groups.where(membership_type: 'rules').map do |group|
          group.rules
               .select(&not_verified_rule)
               .map(&parse_rule_json)
               .map(&:description_multiloc)
        end

        rules.reject(&:empty?)
      end
    end
  end
end
