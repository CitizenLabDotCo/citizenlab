# frozen_string_literal: true

module SmartGroups::Rules
  module CustomFieldRule
    extend ActiveSupport::Concern

    included do
      include ActiveModel::Validations
      include Rule

      attr_accessor :custom_field_id, :predicate, :value

      validates :predicate, presence: true
      validates :predicate, inclusion: { in: self::PREDICATE_VALUES }
      validates :value, absence: true, unless: :needs_value?
      validates :value, presence: true, if: :needs_value?
      validates :custom_field_id, presence: true

      # Must be defined here in order to be able
      # to overwrite the same method in
      # DescribableRule.
      def description_property(locale)
        CustomField.find(custom_field_id).title_multiloc[locale]
      end

      def cachable?
        true
      end

      def cache_key_fragments
        [User.all.cache_key_with_version, predicate, value, custom_field_id]
      end
    end

    class_methods do
      def from_json(json)
        new(json['customFieldId'], json['predicate'], json['value'])
      end
    end

    def as_json
      json = {
        'ruleType' => rule_type,
        'customFieldId' => custom_field_id,
        'predicate' => predicate
      }
      json['value'] = value if needs_value?
      json
    end

    def rule_type
      self.class.rule_type
    end
  end
end
