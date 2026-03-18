# frozen_string_literal: true

module BulkImportIdeas::Parsers::Pdf
  class FormSyncSchemaBuilder
    NOT_FOUND = '_NOT_FOUND_'

    def initialize(phase, locale, personal_data_enabled: false)
      @phase = phase
      @locale = locale
      @personal_data_enabled = personal_data_enabled
      @key_mapping = {}
    end

    # Returns a JSON Schema hash for structured LLM output
    def output_schema
      @output_schema ||= build_schema
    end

    # Returns a Hash mapping schema keys back to original field identifiers
    # Built as a side effect of output_schema construction
    def key_mapping
      output_schema # ensure schema is built
      @key_mapping
    end

    private

    def build_schema
      properties = {}
      required = []

      if @personal_data_enabled
        add_personal_data_properties(properties, required)
      end

      field_num = 0
      printable_form_fields.each do |field|
        next unless field.supports_submission?

        if other_option_field?(field)
          question_key = "question_#{field_num}_other"
        else
          field_num += 1
          question_key = "question_#{field_num}"
        end

        add_field_property(field, question_key, field_num, properties, required)
      end

      {
        type: 'object',
        description: 'An object that represents the answers to a specific paper survey form',
        additionalProperties: false,
        required: required,
        properties: properties
      }
    end

    def add_personal_data_properties(properties, required)
      organization_name = AppConfiguration.instance.settings('core', 'organization_name')[@locale]

      personal_fields = [
        { key: 'first_name', text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.first_name') } },
        { key: 'last_name', text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.last_name') } },
        { key: 'email', text: I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.email_address') } }
      ]

      personal_fields.each do |pf|
        properties[pf[:key]] = {
          type: 'string',
          description: "The respondent's #{pf[:key].tr('_', ' ')} as written under '#{pf[:text]}'. " \
                       "Return an empty string if left blank. Return `#{NOT_FOUND}` if not present in the document."
        }
        required << pf[:key]
        @key_mapping[pf[:key]] = { type: :personal_data, personal_field: pf[:key].to_sym, label: pf[:text] }
      end

      consent_label = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.permission') }
      consent_text = I18n.with_locale(@locale) { I18n.t('form_builder.pdf_export.by_checking_this_box', organizationName: organization_name) }
      properties['consent'] = {
        type: 'string',
        description: "Whether the respondent checked the consent box: '#{consent_text}'. " \
                     "Return `#{NOT_FOUND}` if not present in the document.",
        enum: ['checked', '', NOT_FOUND]
      }
      required << 'consent'
      @key_mapping['consent'] = { type: :personal_data, personal_field: :consent, label: consent_label }
    end

    def add_field_property(field, question_key, question_num, properties, required)
      case field.input_type
      when 'text', 'multiline_text'
        add_text_property(field, question_key, question_num, properties, required)
      when 'select', 'multiselect', 'select_image', 'multiselect_image'
        add_selection_property(field, question_key, question_num, properties, required)
      when 'linear_scale', 'rating', 'sentiment_linear_scale'
        add_scale_property(field, question_key, question_num, properties, required)
      when 'ranking'
        add_ranking_property(field, question_key, question_num, properties, required)
      when 'matrix_linear_scale'
        add_matrix_property(field, question_key, question_num, properties, required)
      when 'checkbox'
        add_checkbox_property(field, question_key, question_num, properties, required)
      else
        add_unsupported_property(field, question_key, question_num, properties, required)
      end
    end

    def add_text_property(field, question_key, question_num, properties, required)
      title = field_title(field)
      properties[question_key] = {
        type: 'string',
        description: "The answer the respondent wrote under question #{question_num}: '#{title}'. " \
                     "Return `#{NOT_FOUND}` if the question was not in the document. " \
                     'Return an empty string if the question was left unanswered.'
      }
      required << question_key
      @key_mapping[question_key] = { type: :field, field_key: field.key }
    end

    def add_selection_property(field, question_key, question_num, properties, required)
      title = field_title(field)
      option_titles = field.options.map { |o| o.title_multiloc[@locale.to_s] }

      properties[question_key] = {
        type: 'array',
        description: "The answer represented by the boxes the respondent checked under question #{question_num}: " \
                     "'#{title}'. If nothing is checked, return an empty array.",
        items: {
          type: 'string',
          enum: option_titles
        }
      }
      required << question_key
      @key_mapping[question_key] = { type: :field, field_key: field.key }
    end

    def add_scale_property(field, question_key, question_num, properties, required)
      title = field_title(field)
      max = field.maximum || 5
      scale_values = (1..max).map(&:to_s)

      properties[question_key] = {
        type: 'string',
        description: "The answer the respondent marked under question #{question_num}: '#{title}'. " \
                     'Return the number as a string. Return an empty string if unanswered. ' \
                     "Return `#{NOT_FOUND}` if the question was not in the document.",
        enum: scale_values + ['', NOT_FOUND]
      }
      required << question_key
      @key_mapping[question_key] = { type: :field, field_key: field.key }
    end

    def add_ranking_property(field, question_key, question_num, properties, required)
      title = field_title(field)
      option_titles = field.options.map { |o| o.title_multiloc[@locale.to_s] }

      properties[question_key] = {
        type: 'array',
        description: "The answer represented by the ranked options under question #{question_num}: '#{title}'. " \
                     'Return option texts ordered by their rank from lowest to highest. ' \
                     'If unanswered, return an empty array.',
        items: {
          type: 'string',
          enum: option_titles
        }
      }
      required << question_key
      @key_mapping[question_key] = { type: :field, field_key: field.key }
    end

    def add_matrix_property(field, question_key, question_num, properties, required)
      title = field_title(field)
      labels = (1..field.maximum).map do |label_num|
        attr_name = :"linear_scale_label_#{label_num}_multiloc"
        field[attr_name][@locale.to_s]
      end.compact_blank

      sub_properties = {}
      sub_required = []
      statement_mapping = {}

      field.matrix_statements.each_with_index do |statement, index|
        sub_key = "#{question_key}.#{index + 1}"
        statement_title = statement.title_multiloc[@locale.to_s]

        sub_properties[sub_key] = {
          type: 'string',
          description: 'The answer represented by the checkbox the respondent checked corresponding to the statement ' \
                       "'#{statement_title}'. Return an empty string if the statement was left unanswered. " \
                       "Return `#{NOT_FOUND}` if the question was not in the document.",
          enum: labels + ['', NOT_FOUND]
        }
        sub_required << sub_key
        statement_mapping[sub_key] = statement.key
      end

      properties[question_key] = {
        type: 'object',
        description: "The answers represented by the table of matrix questions under question #{question_num}: " \
                     "'#{title}'.",
        additionalProperties: false,
        required: sub_required,
        properties: sub_properties
      }
      required << question_key
      @key_mapping[question_key] = {
        type: :matrix,
        field_key: field.key,
        statements: statement_mapping
      }
    end

    def add_checkbox_property(field, question_key, question_num, properties, required)
      title = field_title(field)
      properties[question_key] = {
        type: 'string',
        description: "Whether the respondent checked the box under question #{question_num}: '#{title}'. " \
                     "Return an empty string if not checked. Return `#{NOT_FOUND}` if the question was not in the document.",
        enum: ['checked', '', NOT_FOUND]
      }
      required << question_key
      @key_mapping[question_key] = { type: :field, field_key: field.key }
    end

    def add_unsupported_property(_field, question_key, question_num, properties, required)
      properties[question_key] = {
        type: 'null',
        description: "Question #{question_num} is a field type that is unsupported. Always return null."
      }
      required << question_key
    end

    def other_option_field?(field)
      field.key&.end_with?('_other') && field.new_record?
    end

    def field_title(field)
      field.title_multiloc[@locale.to_s]
    end

    def printable_form_fields
      @printable_form_fields ||= IdeaCustomFieldsService.new(@phase.pmethod.custom_form).printable_fields
    end
  end
end
