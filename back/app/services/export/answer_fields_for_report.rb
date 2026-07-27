# frozen_string_literal: true

module Export
  # Expands a single field into the report fields that capture a respondent's
  # answer(s) to it, so the xlsx and pdf exports assemble question/answer columns
  # the same way:
  #   - a user/registration field yields one author-scoped field (read from the
  #     respondent's profile);
  #   - a matrix question yields one field per statement; and
  #   - any other question yields the answer itself plus its "other" and
  #     follow-up free-text answers (when the field defines them).
  # Every returned object responds to #column_header, #value_from(input) and
  # #hyperlink? (see CustomFieldForExport / ComputedFieldForReport), so
  # callers can treat matrix statements and plain answers uniformly.
  class AnswerFieldsForReport
    def initialize(value_visitor)
      @value_visitor = value_visitor
      @multiloc_service = MultilocService.new(app_configuration: AppConfiguration.instance)
    end

    def fields_for(field)
      if field.resource_type == 'User'
        # Registration fields answered on the author's profile: read author-
        # scoped, with no matrix/other/follow-up expansion.
        [CustomFieldForExport.new(field, value_visitor, :author)]
      elsif field.input_type == 'matrix_linear_scale'
        matrix_statement_fields(field)
      else
        [CustomFieldForExport.new(field, value_visitor), *other_and_follow_up_fields(field)]
      end
    end

    private

    attr_reader :value_visitor, :multiloc_service

    def matrix_statement_fields(field)
      field.matrix_statements.map do |statement|
        ComputedFieldForReport.new(
          multiloc_service.t(statement.title_multiloc),
          ->(input) { input.custom_field_values.dig(statement.custom_field.key, statement.key) }
        )
      end
    end

    # "Other" and follow-up answers live on derived text fields rather than in
    # the exportable form fields, so they must be pulled in explicitly.
    def other_and_follow_up_fields(field)
      [field.other_option_text_field, field.follow_up_text_field].compact.map do |text_field|
        CustomFieldForExport.new(text_field, value_visitor)
      end
    end
  end
end
