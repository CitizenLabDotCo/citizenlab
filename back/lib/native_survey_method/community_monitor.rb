# frozen_string_literal: true

module NativeSurveyMethod
  class CommunityMonitor < Base
    def allowed_extra_field_input_types
      %w[page text linear_scale rating select multiselect]
    end

    def default_fields(custom_form)
      return [] if custom_form.persisted?

      multiloc_service = MultilocService.new
      [
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'page1',
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default'
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          key: CustomFieldService.new.generate_key(
            multiloc_service.i18n_to_multiloc('form_builder.default_select_field.title').values.first
          ),
          resource: custom_form,
          input_type: 'select',
          title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.default_select_field.title'),
          options: [
            CustomFieldOption.new(
              id: SecureRandom.uuid,
              key: 'option1',
              title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.default_select_field.option1')
            ),
            CustomFieldOption.new(
              id: SecureRandom.uuid,
              key: 'option2',
              title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.default_select_field.option2')
            )
          ]
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'test',
          input_type: 'text',
          title_multiloc: { en: 'Test' }
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'survey_end',
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default',
          title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
          description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3')
        )
      ]
    end

    def allow_logic?
      false
    end
  end
end
