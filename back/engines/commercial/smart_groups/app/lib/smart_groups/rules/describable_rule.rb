# frozen_string_literal: true

module SmartGroups::Rules
  module DescribableRule
    extend ActiveSupport::Concern

    def description_multiloc
      MultilocService.new.block_to_multiloc do |locale|
        # TODO: .sub is a temporary fix until we deploy the copy changes to the front-end
        predicate_temp = predicate.sub 'reacted', 'voted'
        case predicate_temp
        when 'is_empty'
          I18n.t!('smart_group_rules.is_empty', property: description_property(locale))
        when 'not_is_empty'
          I18n.t!('smart_group_rules.not_is_empty', property: description_property(locale))
        else
          begin
            I18n.t!(
              "smart_group_rules.#{description_rule_type}.#{predicate_temp}_#{value}",
              property: description_property(locale)
            )
          rescue I18n::MissingTranslationData
            begin
              I18n.t!(
                "smart_group_rules.#{description_rule_type}.#{predicate_temp}",
                property: description_property(locale),
                value: description_value(locale)
              )
            rescue I18n::MissingTranslationData
              raise "Unsupported rule description: smart_group_rules.#{description_rule_type}.#{predicate_temp}{_#{value}}"
            end
          end
        end
      end
    end

    def description_value(_locale)
      value
    end

    def description_rule_type
      self.class.rule_type
    end

    def description_property(_locale)
      nil
    end

    def value
      nil
    end
  end
end
