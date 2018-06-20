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


  end

end