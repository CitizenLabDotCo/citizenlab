# frozen_string_literal: true

class FormLogicService
  def initialize(fields)
    @fields = fields
    @field_index = fields.index_by(&:id)
    @option_index = fields.flat_map(&:options).index_by(&:id)
  end

  def ui_schema_rules_for(target_field)
    target_field_rules[target_field.id]
  end

  def replace_temp_ids!(page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
    fields.each do |field|
      next if field.logic.blank?

      if field.page?
        replace_temp_ids_in_page_logic!(field, page_temp_ids_to_ids_mapping)
      else
        replace_temp_ids_in_field_logic!(field, page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
      end
    end
  end

  def valid?
    fields.inject(true) do |all_valid, field|
      next all_valid unless field.logic?

      field_valid = if field.page?
        valid_page_logic_structure?(field) && valid_next_page?(field)
      else
        valid_field_logic_structure?(field) && valid_rules?(field)
      end
      all_valid && field_valid
    end
  end

  def remove_select_logic_option_from_custom_fields(frozen_custom_field_option)
    custom_field = frozen_custom_field_option.custom_field

    return unless custom_field&.logic.present? &&
                  custom_field.logic['rules'].pluck('if').include?(frozen_custom_field_option.id)

    custom_field.logic['rules'].reject! { |rule| rule['if'] == frozen_custom_field_option.id }
    custom_field.save!
  end

  private

  attr_reader :fields, :field_index, :option_index

  def valid_field_logic_structure?(field)
    logic = field.logic
    if logic.keys == ['rules']
      all_rules_are_valid = logic['rules'].all? do |rule|
        rule.keys == %w[if goto_page_id]
      end
      return true if all_rules_are_valid
    end
    add_invalid_structure_error(field)
    false
  end

  def valid_page_logic_structure?(field)
    return true if field.logic.keys == ['next_page_id']

    add_invalid_structure_error(field)
    false
  end

  def valid_next_page?(field)
    target_id = field.logic['next_page_id'] # Present because we passed the `valid_page_logic_structure?` check.

    # Order is important here, because `target_after_source?` and `target_is_page?`
    # rely on `valid_next_page_id?` to return true. In those methods,
    # `field_index[target_id]` will always return a field.
    valid_next_page_id?(target_id, field) && target_after_source?(target_id, field) && target_is_page?(target_id, field)
  end

  def valid_rules?(field)
    field.logic['rules'].all? do |rule|
      target_id = rule['goto_page_id'] # Present because we passed the `valid_field_logic_structure?` check.

      # Order is important here, because `target_after_source?` and `target_is_page?`
      # rely on `valid_goto_page_id?` to return true. In those methods,
      # `field_index[target_id]` will always return a field.
      valid_goto_page_id?(target_id, field) && target_after_source?(target_id, field) && target_is_page?(target_id, field)
    end
  end

  def valid_next_page_id?(next_page_id, field)
    return true if field_index.key? next_page_id

    add_invalid_next_page_id_error(field, next_page_id)
    false
  end

  def valid_goto_page_id?(target_id, field)
    return true if field_index.key? target_id

    add_invalid_goto_page_id_error(field, target_id)
    false
  end

  def target_after_source?(target_id, source_field)
    target_field = field_index[target_id]
    return true if target_field.ordering > source_field.ordering

    add_target_before_source_not_allowed_error(source_field, target_id)
    false
  end

  def target_is_page?(target_id, field)
    target_field = field_index[target_id]
    return true if target_field.page?

    add_only_page_allowed_as_target_error(field, target_id)
    false
  end

  def add_invalid_structure_error(field)
    field.errors.add(:logic, :invalid_structure, message: 'has invalid structure')
  end

  def add_invalid_goto_page_id_error(field, target_id)
    field.errors.add(
      :logic,
      :invalid_goto_page_id,
      message: 'has invalid goto_page_id',
      value: target_id
    )
  end

  def add_invalid_next_page_id_error(field, target_id)
    field.errors.add(
      :logic,
      :invalid_next_page_id,
      message: 'has invalid next_page_id',
      value: target_id
    )
  end

  def add_target_before_source_not_allowed_error(field, target_id)
    field.errors.add(
      :logic,
      :target_before_source_not_allowed,
      message: 'has target before source',
      value: target_id
    )
  end

  def add_only_page_allowed_as_target_error(field, target_id)
    field.errors.add(
      :logic,
      :only_page_allowed_as_target,
      message: 'has target that is not a page',
      value: target_id
    )
  end

  def ui_schema_hide_rule_for(field, value)
    if field.support_options? && value != 'no_answer'
      value = option_index[value].key
    end
    {
      effect: 'HIDE',
      condition: {
        scope: "#/properties/#{field.key}",
        schema: {
          enum: [value]
        }
      }
    }
  end

  def ui_schema_next_page_rule_for(field)
    {
      effect: 'HIDE',
      condition: {
        type: 'HIDEPAGE',
        pageId: field.id
      }
    }
  end

  def target_field_rules
    @target_field_rules ||= {}.tap do |accu|
      current_page = nil
      fields.each_with_index do |field, index|
        if field.page?
          current_page = field
          add_rules_for_page(field, index, accu)
        else
          # current_page is nil when the form starts with a question
          next_page_id = current_page ? current_page.logic['next_page_id'] : nil
          add_rules_for_field(field, index, next_page_id, accu)
        end
      end
    end
  end

  def add_rules_for_page(field, index, rules_accu)
    target_id = field.logic['next_page_id']
    return if target_id.blank?

    pages_to_hide = pages_in_between(index, target_id)
    pages_to_hide.each do |page|
      rules_accu[page.id] ||= []
      rules_accu[page.id] << ui_schema_next_page_rule_for(field)
    end
  end

  def add_rules_for_field(field, index, next_page_id, rules_accu)
    rules = field.logic['rules']
    return if rules.blank?

    # Question-level logic trumps page-level logic.
    # So start collecting question-level logic.
    logic = question_level_logic_for_field(field, rules, next_page_id)

    # Then apply page-level logic if no question-level logic is present.
    logic = page_level_logic_for_field(logic, field, next_page_id) if next_page_id

    # Finally add the rules for the collected logic.
    logic.each do |value, target_page_id|
      pages_to_hide = pages_in_between(index, target_page_id)
      pages_to_hide.each do |page|
        rules_accu[page.id] ||= []
        rules_accu[page.id] << ui_schema_hide_rule_for(field, value)
      end
    end
  end

  def question_level_logic_for_field(field, rules, next_page_id)
    logic = rules.each_with_object({}) do |rule, accu|
      value = rule['if']
      target_id = rule['goto_page_id']
      accu[value] = target_id unless value == 'any_other_answer'
    end

    # Fill in option IDs for 'any_other_answer' rule
    any_other_answer_rule = rules.find { |rule| rule['if'] == 'any_other_answer' }
    if any_other_answer_rule
      target_id = any_other_answer_rule['goto_page_id']
      if field.support_options?
        field.options.each do |option|
          logic[option.id] = target_id unless logic.key?(option.id)
        end
      elsif field.linear_scale?
        (1..field.maximum).each do |scale_value|
          logic[scale_value] = target_id unless logic.key?(scale_value)
        end
      end
    end

    # If there is page logic and question logic on a non-required field, but with no 'no_answer' then we need to explicitly create it
    if !field.required && next_page_id && logic && !logic.key?('no_answer')
      logic['no_answer'] = next_page_id
    end
    logic
  end

  def page_level_logic_for_field(logic, field, next_page_id)
    if field.support_options?
      field.options.each do |option|
        value = option.id
        next if logic.key?(value)

        logic[value] = next_page_id
      end
    elsif field.linear_scale?
      (1..field.maximum).each do |value|
        next if logic.key?(value)

        logic[value] = next_page_id
      end
    end
    logic
  end

  def pages_after(index)
    fields.drop(index + 1).select(&:page?)
  end

  def pages_in_between(index, page_id)
    pages = []
    index += 1
    last_page_id = fields.last.id

    while index < fields.size
      return pages if fields[index].id == page_id
      return pages if fields[index].id == last_page_id

      pages << fields[index] if fields[index].page?
      index += 1
    end
    pages
  end

  def replace_temp_ids_in_page_logic!(field, page_temp_ids_to_ids_mapping)
    logic = field.logic
    target_id = logic['next_page_id']
    if page_temp_ids_to_ids_mapping.include?(target_id)
      logic['next_page_id'] = page_temp_ids_to_ids_mapping[target_id]
    end
    field.update! logic: logic
  end

  def replace_temp_ids_in_field_logic!(field, page_temp_ids_to_ids_mapping, option_temp_ids_to_ids_mapping)
    logic = field.logic
    rules = logic.fetch('rules', [])
    rules.each do |rule|
      value = rule['if']
      if option_temp_ids_to_ids_mapping.include?(value)
        rule['if'] = option_temp_ids_to_ids_mapping[value]
      end
      target_id = rule['goto_page_id']
      if page_temp_ids_to_ids_mapping.include?(target_id)
        rule['goto_page_id'] = page_temp_ids_to_ids_mapping[target_id]
      end

      # Remove any select options that do not exist - unless 'any_other_answer' or 'no_answer'
      allowed_if_values = field.options.pluck(:id)
      allowed_if_values << 'any_other_answer'
      allowed_if_values << 'no_answer' unless field.required?
      if field.support_options? && allowed_if_values.exclude?(rule['if'])
        rules.delete(rule)
      end
    end
    field.update! logic: logic
  end
end
