# frozen_string_literal: true

class FormLogicService
  def initialize(fields)
    @fields = fields
  end

  def ui_schema_rules_for(field)
    target_field_rules[field.id]
  end

  def replace_temp_ids!(temp_ids_to_ids_mapping)
    fields.each do |field|
      next if field.logic.blank?

      logic = field.logic
      rules = logic.fetch('rules', [])
      rules.each do |rule|
        rule['then'].each do |action|
          target_id = action['target_id']
          if temp_ids_to_ids_mapping.include?(target_id)
            action['target_id'] = temp_ids_to_ids_mapping[target_id]
          end
        end
      end
      field.update! logic: logic
    end
  end

  def valid?
    fields.all? do |field|
      valid_structure? field.logic
    end
  end

  private

  EFFECTS = %w[show hide submit_survey]

  attr_reader :fields

  def valid_structure?(logic)
    return true if logic == {}
    return false unless logic.keys == ['rules']

    logic['rules'].all? do |rule|
      rule.keys == %w[if then] && rule['then'].all? do |action|
        allowed_then_keys = %w[effect]
        allowed_then_keys << 'target_id' if action['effect'] != 'submit_survey'
        action.keys == allowed_then_keys && EFFECTS.include?(action['effect'])
      end
    end
  end

  def ui_schema_rule_for(effect, field, value)
    {
      effect: effect.upcase,
      condition: {
        scope: "#/properties/#{field.key}",
        schema: {
          enum: [value]
        }
      }
    }
  end

  def target_field_rules
    # Be robust against any missing data in the logic,
    # because the logic json is not validated in any way.
    @target_field_rules ||= fields.each_with_object({}) do |field, accu|
      rules = field.logic['rules']
      next if rules.blank?

      rules.each do |rule|
        next unless rule.key?('if') && rule.key?('then')

        value = rule['if']
        actions = rule['then']
        actions.each do |action|
          effect = action['effect']
          case effect
          when 'hide', 'show'
            target_id = action['target_id']
            accu[target_id] ||= []
            accu[target_id] << ui_schema_rule_for(effect, field, value)
          when 'submit_survey'
            # TODO
          end
        end
      end
    end
  end
end
