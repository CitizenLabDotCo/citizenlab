# frozen_string_literal: true

class UserUiSchemaGeneratorService < UiSchemaGeneratorService
  protected

  def generate_for_current_locale(fields)
    {
      type: 'VerticalLayout',
      options: {
        formId: 'user-form'
      },
      elements: fields.filter_map do |field|
        visit field
      end
    }
  end
end
