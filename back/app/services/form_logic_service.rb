# frozen_string_literal: true

class FormLogicService
  def initialize(fields)
    @fields = fields
  end

  def ui_schema_rules_for(field)
    target_field_rules[field.id]
  end

  private

  attr_reader :fields

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
          # else ignore missing and unknown effects
          end
        end
      end
    end
  end
end
