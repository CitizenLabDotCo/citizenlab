module IdeaCustomFields
  class CustomFieldsService
    def find_or_build_field custom_form, code
      custom_form&.custom_fields&.find_by(code: code) ||
        IdeaCustomFieldsService.call(custom_form).find { |bicf| bicf.code == code }
    end
  end
end
