module SmartGroupRules
  class CustomFieldText

    PREDICATE_VALUES = %w(is not_is contains not_contains begins_with not_begins_with ends_on not_ends_on is_empty not_is_empty)
    RULE_TYPE = "custom_field_text"

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.where(input_type: 'text').map(&:id) } }

    def self.to_json_schema custom_field, locale

    end

    def initialize custom_field_id, predicate, value=nil
      self.custom_field_id = custom_field_id
      self.predicate = predicate
      self.value = value
    end

    def filter users_scope
      custom_field = CustomField.find(custom_field_id)
      key = custom_field.key
      case predicate
      when 'is'
        users_scope.where("custom_field_values->>'#{key}' = ?", value)
      when 'not_is'
        users_scope.where("custom_field_values->>'#{key}' <> ?", value)
      else
        raise "Unsupported predicate #{predicate}"
      end
    end

    private

    def needs_value?
      !%w(is_empty not_is_empty).include?(predicate)
    end

  end
end