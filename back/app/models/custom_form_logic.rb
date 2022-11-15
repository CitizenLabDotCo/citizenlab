# frozen_string_literal: true

class CustomFormLogic < ApplicationRecord
  acts_as_list column: :ordering, top_of_list: 0, scope: %i[source_field_id target_field_id]
  # TODO: order scope for source and target fields

  belongs_to :source_field, class_name: 'CustomField'
  belongs_to :target_field, class_name: 'CustomField'

  # TODO: validations
  # - source and target fields present
  # - source and target fields same custom form
  # - source field cannot be page, target field must be page
  # - source field before target field
  # - condition_operator present and inclusion from list
  # - one value attribute present, others nil
  # - action present and inclusion from list

  def satisfies?(custom_field_values)
    # TODO
    true
  end

  def ui_schema_rule
    case condition_operator
    when 'EQUALITY'
      ui_schema_rule_equality
    else
      raise "Unsupported condition operator #{condition_operator}"
    end
  end

  private

  def ui_schema_rule_equality
    enum_value = case source_field.input_type
    when 'linear_scale'
      [condition_value_number]
    when 'select'
      condition_value_select
    else
      raise "Unsupoported input type #{source_field.input_type}"
    end
    {
      enum: enum_value
    }
  end
end
