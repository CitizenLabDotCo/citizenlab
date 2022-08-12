# frozen_string_literal: true

class UserUiSchemaGeneratorService < UiSchemaGeneratorService
  def fields_to_ui_schema(fields, locale)
    {
      type: 'VerticalLayout',
      options: {
        formId: 'user-form'
      },
      elements: fields.filter_map do |field|
        visit_or_filter field
      end
    }
  end
end
