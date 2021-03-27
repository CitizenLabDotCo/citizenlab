module SmartGroups
  module Patches
    module GroupPolicy
      def permitted_attributes
        super.push(rules: [:ruleType, :customFieldId, :predicate, :value, { value: [] }])
      end
    end
  end
end
