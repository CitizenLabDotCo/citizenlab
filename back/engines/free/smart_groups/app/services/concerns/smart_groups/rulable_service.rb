module SmartGroups
  module RulableService
    extend ActiveSupport::Concern

    included do
      delegate :rule_classes_by_type, :rules, :each_rule, :rule_type_to_class, to: :class
    end

    class_methods do
      def rules
        @rules ||= []
      end

      def add_rules(*rule_classes)
        rules.push(*rule_classes)
      end

      def add_rule(rule_class)
        rules.push(rule_class)
      end

      def rule_classes_by_type
        rules.index_by(&:rule_type)
      end

      def each_rule
        rule_classes_by_type.values.each
      end

      def rule_type_to_class(rule_type)
        rule_classes_by_type[rule_type]
      end
    end
  end
end
