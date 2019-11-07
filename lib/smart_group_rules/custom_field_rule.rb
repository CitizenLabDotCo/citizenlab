module SmartGroupRules

  module CustomFieldRule
    extend ActiveSupport::Concern

    included do
      include ActiveModel::Validations

      attr_accessor :custom_field_id, :predicate, :value

      validates :predicate, presence: true
      validates :predicate, inclusion: { in: self::PREDICATE_VALUES }
      validates :value, absence: true, unless: :needs_value?
      validates :value, presence: true, if: :needs_value?
      validates :custom_field_id, presence: true
    end

    class_methods do
      def from_json json
        self.new(json['customFieldId'], json['predicate'], json['value'])
      end
    end

    def as_json
      json = {
        'ruleType' => self.class::RULE_TYPE,
        'customFieldId' => custom_field_id,
        'predicate' => predicate,
      }
      json['value'] = value if needs_value?
      json    
    end

    def rule_type
      self.class.rule_type
    end

    def description_multiloc
      MultilocService.new.block_to_multiloc do |locale|
        custom_field_title = CustomField.find(custom_field_id).title_multiloc[locale]
        begin
          I18n.t!("smart_group_rules.#{rule_type}.#{predicate}_#{value}", title: custom_field_title)
        rescue I18n::MissingTranslationData
          begin 
            I18n.t!("smart_group_rules.#{rule_type}.#{predicate}", title: custom_field_title, value: value)
          rescue I18n::MissingTranslationData
            raise "Unsupported rule description: smart_group_rules.#{rule_type}.#{predicate}{_#{value}}"
          end
        end
      end
    end

  end

end