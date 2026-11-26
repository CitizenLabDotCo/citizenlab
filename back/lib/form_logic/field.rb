# frozen_string_literal: true

module FormLogic
  # The attributes of a custom field the engine needs, so the engine runs the same on
  # records, on in-memory fields (such as the injected user fields page) and on fixtures.
  Field = Struct.new(:id, :key, :input_type, :required, :enabled, :maximum, :options, :logic, keyword_init: true) do
    def self.from_custom_field(custom_field)
      new(
        id: custom_field.id,
        key: custom_field.key,
        input_type: custom_field.input_type,
        required: custom_field.required? == true,
        enabled: custom_field.enabled? != false,
        maximum: custom_field.maximum,
        options: custom_field.options.map { |option| Option.new(id: option.id, key: option.answer_key) },
        logic: custom_field.logic || {}
      )
    end

    def self.from_h(attributes)
      new(
        id: attributes.fetch('id'),
        key: attributes.fetch('key'),
        input_type: attributes.fetch('input_type'),
        required: attributes['required'] == true,
        enabled: attributes['enabled'] != false,
        maximum: attributes['maximum'],
        options: (attributes['options'] || []).map { |option| Option.new(id: option.fetch('id'), key: option.fetch('key')) },
        logic: attributes['logic'] || {}
      )
    end

    def self.wrap(field)
      field.is_a?(Field) ? field : from_custom_field(field)
    end

    def page?
      input_type == 'page'
    end

    def question?
      !page?
    end

    def form_end?
      page? && key == 'form_end'
    end

    def user_page?
      page? && key == 'user_page'
    end

    def option_ids
      options.map(&:id)
    end

    def logic_operators
      strategy = "InputTypeStrategy::#{input_type.to_s.camelize}".safe_constantize
      strategy && strategy < InputTypeStrategy::Base ? strategy.new(nil).logic_operators : []
    end
  end

  Option = Struct.new(:id, :key, keyword_init: true)
end
