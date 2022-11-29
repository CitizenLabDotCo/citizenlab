# frozen_string_literal: true

class FormLogicService
  def initialize(fields)
    @fields = fields
    @field_index = fields.index_by(&:id)
  end

  def ui_schema_rules_for(target_field)
    target_field_rules[target_field.id]
  end

  def replace_temp_ids!(temp_ids_to_ids_mapping)
    fields.each do |field|
      next if field.logic.blank?

      logic = field.logic
      rules = logic.fetch('rules', [])
      rules.each do |rule|
        target_id = rule['goto_page_id']
        if temp_ids_to_ids_mapping.include?(target_id)
          rule['goto_page_id'] = temp_ids_to_ids_mapping[target_id]
        end
      end
      field.update! logic: logic
    end
  end

  def valid?
    fields.all? do |field|
      unless valid_structure? field.logic
        field.errors.add(:logic, :invalid_structure, message: 'has invalid structure')
        next false
      end
      next true if field.logic.blank?

      if field.page?
        field.errors.add(
          :logic,
          :page_not_allowed_as_source,
          message: 'is not allowed on pages'
        )
        next false
      end

      field.logic['rules'].all? do |rule|
        next true if rule.key? 'goto' # Value for `goto` has already been checked in `valid_structure?`

        target_id = rule['goto_page_id'] # Present because we passed the `valid_structure?` check.

        # Order is important here, because `target_after_source?` and `target_is_page?`
        # rely on `valid_target_id?` to return true. In those methods,
        # `field_index[target_id]` will always return a field.
        unless valid_target_id?(target_id)
          field.errors.add(
            :logic,
            :invalid_goto_page_id,
            message: 'has invalid goto_page_id',
            value: target_id
          )
          next false
        end
        unless target_after_source?(target_id, field)
          field.errors.add(
            :logic,
            :target_before_source_not_allowed,
            message: 'has target before source',
            value: target_id
          )
          next false
        end

        next true if target_is_page?(target_id)

        field.errors.add(
          :logic,
          :only_page_allowed_as_target,
          message: 'has target that is not a page',
          value: target_id
        )
        false
      end
    end
  end

  private

  attr_reader :fields, :field_index

  def valid_structure?(logic)
    return true if logic == {}
    return false unless logic.keys == ['rules']

    logic['rules'].all? do |rule|
      rule.keys == %w[if goto_page_id] || (rule.keys == %w[if goto] && rule['goto'] == 'end_page')
    end
  end

  def valid_target_id?(target_id)
    field_index.key? target_id
  end

  def target_after_source?(target_id, source_field)
    target_field = field_index[target_id]
    target_field.ordering > source_field.ordering
  end

  def target_is_page?(target_id)
    target_field = field_index[target_id]
    target_field.page?
  end

  def ui_schema_hide_rule_for(field, value)
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

  def target_field_rules
    @target_field_rules ||= {}.tap do |accu|
      fields.each_with_index do |field, index|
        rules = field.logic['rules']
        next if rules.blank?

        rules.each do |rule|
          value = rule['if']
          target_id = rule['goto_page_id']
          pages_in_between(index, target_id).each do |page|
            accu[page.id] ||= []
            accu[page.id] << ui_schema_hide_rule_for(field, value)
          end
        end
      end
    end
  end

  def pages_in_between(index, page_id)
    pages = []
    index += 1
    while index < fields.size
      return pages if fields[index].id == page_id

      pages << fields[index] if fields[index].page?
      index += 1
    end
    pages
  end
end
