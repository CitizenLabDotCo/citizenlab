# frozen_string_literal: true

module FormLogic
  # Validates the engine's logic for a whole form in memory, before anything is saved.
  # Returns { field id => [{ error:, path:, value: }] }, empty when valid. `path` points into
  # the field's logic, e.g. "jumps.0.when.all.1". Each condition gets at most one error.
  class Validator
    PAGE_KEYS = %w[jumps next].freeze
    QUESTION_KEYS = %w[display required_if].freeze
    LEAF_KEYS = %w[field op value].freeze
    GROUP_KEYS = %w[all any not].freeze
    OPTION_OPERATORS = Conditions::LIST_OPERATORS
    VALUELESS_OPERATORS = %w[present absent].freeze

    def initialize(fields, logic)
      @all_fields = fields.map { |field| Field.wrap(field) }
      @fields = @all_fields.select(&:enabled)
      @logic = logic || {}
      @position = @fields.each_with_index.to_h { |field, index| [field.id, index] }
      @pages = @fields.select(&:page?)
      @page_position = @pages.each_with_index.to_h { |page, index| [page.id, index] }
    end

    def call
      @logic.each_with_object({}) do |(field_id, logic), errors|
        field_errors = validate_field(field_id, logic)
        errors[field_id] = field_errors if field_errors.any?
      end
    end

    private

    def validate_field(field_id, logic)
      @errors = []
      field = @all_fields.find { |f| f.id == field_id }
      return [error(:unknown_field, '', field_id)] unless field
      return [error(:field_disabled, '')] unless field.enabled
      return [error(:invalid_logic, '')] unless logic.is_a?(Hash)
      return [error(:logic_on_end_page, '')] if field.form_end? && logic.any?

      allowed = field.page? ? PAGE_KEYS : QUESTION_KEYS
      logic.each_key { |key| @errors << error(:unknown_key, key) unless allowed.include?(key) }
      field.page? ? validate_page(field, logic) : validate_question(field, logic)
      @errors
    end

    def validate_page(page, logic)
      validate_target(page, logic['next'], 'next') unless logic['next'].nil?
      return if logic['jumps'].nil?
      return @errors << error(:invalid_logic, 'jumps') unless logic['jumps'].is_a?(Array)

      logic['jumps'].each_with_index do |jump, index|
        path = "jumps.#{index}"
        next @errors << error(:invalid_logic, path) unless jump.is_a?(Hash)

        validate_condition(jump['when'], "#{path}.when", last_position_on(page))
        validate_target(page, jump['goto'], "#{path}.goto")
      end
    end

    def validate_question(question, logic)
      QUESTION_KEYS.each do |key|
        validate_condition(logic[key], key, @position[question.id] - 1) unless logic[key].nil?
      end
    end

    def validate_target(page, target, path)
      return if target == END_TARGET
      return @errors << error(:unknown_target, path, target) unless @page_position.key?(target)

      @errors << error(:target_not_forward, path, target) if @page_position[target] <= @page_position[page.id]
    end

    # latest: the last form position a source may have.
    def validate_condition(condition, path, latest)
      return @errors << error(:invalid_condition, path) unless condition.is_a?(Hash)

      groups = condition.keys & GROUP_KEYS
      return validate_leaf(condition, path, latest) if groups.empty?
      return @errors << error(:invalid_condition, path) if condition.size > 1

      group = groups.first
      return validate_condition(condition['not'], "#{path}.not", latest) if group == 'not'

      parts = condition[group]
      return @errors << error(:invalid_condition, "#{path}.#{group}") unless parts.is_a?(Array)
      return @errors << error(:empty_group, "#{path}.#{group}") if parts.empty?

      parts.each_with_index { |part, index| validate_condition(part, "#{path}.#{group}.#{index}", latest) }
    end

    def validate_leaf(leaf, path, latest)
      return @errors << error(:invalid_condition, path) unless (leaf.keys - LEAF_KEYS).empty?

      operator = leaf['op']
      return @errors << error(:unknown_operator, path, operator) unless Conditions::OPERATORS.include?(operator)

      source_error = source_error(leaf['field'], latest)
      return @errors << error(source_error, path, leaf['field']) if source_error

      source = @fields.find { |field| field.id == leaf['field'] }
      return @errors << error(:operator_not_supported, path, operator) unless source.logic_operators.include?(operator)

      code, value = value_error(source, operator, leaf['value'])
      @errors << error(code, path, value) if code
    end

    def source_error(field_id, latest)
      field = @all_fields.find { |f| f.id == field_id }
      return :unknown_field unless field
      return :source_is_page if field.page?
      return :source_disabled unless field.enabled

      :source_after_target if @position[field_id] > latest
    end

    # Returns [code, value] or nil.
    def value_error(source, operator, value)
      return value.nil? ? nil : [:invalid_value, value] if VALUELESS_OPERATORS.include?(operator)
      return list_error(source, value) if OPTION_OPERATORS.include?(operator)

      [:invalid_value, value] unless scale_value?(source, value)
    end

    def list_error(source, value)
      return [:invalid_value, value] unless value.is_a?(Array) && value.any?

      if source.options.any? || !scale?(source)
        unknown = value.find { |id| source.option_ids.exclude?(id) }
        return unknown.nil? ? nil : [:unknown_option, unknown]
      end

      invalid = value.find { |number| !scale_value?(source, number) }
      invalid.nil? ? nil : [:invalid_value, invalid]
    end

    def scale?(source)
      LegacyNormalizer::SCALE_TYPES.include?(source.input_type)
    end

    def scale_value?(source, value)
      value.is_a?(Integer) && value >= 1 && (source.maximum.nil? || value <= source.maximum)
    end

    def last_position_on(page)
      next_page = @pages[@page_position[page.id] + 1]
      next_page ? @position[next_page.id] - 1 : @fields.size - 1
    end

    def error(code, path, value = :none)
      value == :none ? { error: code, path: path } : { error: code, path: path, value: value }
    end
  end
end
