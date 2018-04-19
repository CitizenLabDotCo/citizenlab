module SmartGroupRules
  class CustomFieldSelect

    PREDICATE_VALUES = %w(has_value not_has_value is_empty not_is_empty)
    RULE_TYPE = "custom_field_select"

    include CustomFieldRule

    validates :custom_field_id, inclusion: { in: proc { CustomField.where(input_type: ['select', 'multiselect']).map(&:id) } }
    validates :value, inclusion: { in: -> (record) { CustomFieldOption.where(custom_field_id: record.custom_field_id).map(&:id) } }, if: :needs_value?

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
      if custom_field.input_type == 'select'
        case predicate
        when 'has_value'
          option_key = CustomFieldOption.find(value).key
          users_scope.where("custom_field_values->>'#{key}' = ?", option_key)
        when 'not_has_value'
          option_key = CustomFieldOption.find(value).key
          users_scope.where("custom_field_values->>'#{key}' <> ?", option_key)
        else
          raise "Unsupported predicate #{predicate}"
        end
      elsif custom_field.input_type == 'multiselect'

      end
    end

    private

    def needs_value?
      !%w(is_empty not_is_empty).include?(predicate)
    end

  end
end