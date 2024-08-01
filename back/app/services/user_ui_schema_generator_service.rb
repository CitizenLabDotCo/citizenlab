# frozen_string_literal: true

class UserUiSchemaGeneratorService < UiSchemaGeneratorService
  protected

  def generate_for_current_locale(fields)
    ui_fields = fields.filter_map do |field|
      visit field
    end

    puts '=' * 20
    puts 'vwhqauioegytu'
    puts ui_fields
    puts '=' * 20
    puts 'vnreuowhrtbt'
    puts locked_custom_fields
    puts '=' * 20

    ui_fields = mark_locked_fields(ui_fields)

    {
      type: 'VerticalLayout',
      options: {
        formId: 'user-form'
      },
      elements: ui_fields
    }
  end

  def locked_custom_fields
    # @locked_custom_fields ||= VerificationService.new.locked_custom_fields(current_user).map(&:to_s)
    []
  end

  private

  def mark_locked_fields(ui_fields)
    ui_fields.map do |ui_field|
      # TODO
      ui_field
    end
  end
end
