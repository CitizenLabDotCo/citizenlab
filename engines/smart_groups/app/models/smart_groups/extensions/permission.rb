module SmartGroups
  module Extensions
    module Permission
      def participation_conditions
        service = SmartGroupsService.new
        groups.select(&:rules?).map do |group|
          group.rules.select do |rule|
            rule['ruleType'] != 'verified'
          end.map do |rule|
            service.parse_json_rule rule
          end.map(&:description_multiloc)
        end.reject { |rules| rules.empty? }
      end
    end
  end
end
