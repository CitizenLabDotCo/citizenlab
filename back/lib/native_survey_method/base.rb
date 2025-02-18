# frozen_string_literal: true

module NativeSurveyMethod
  class Base
    def initialize(phase)
      @phase = phase
    end

    def allowed_extra_field_input_types
      %w[page number linear_scale rating text multiline_text select multiselect
        multiselect_image file_upload shapefile_upload point line polygon
        ranking matrix_linear_scale]
    end

    def default_fields(custom_form)
      return [] if custom_form.persisted?

      multiloc_service = MultilocService.new
      [
        start_page_field(custom_form),
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
        end_page_field(custom_form, multiloc_service)
      ]
    end

    def logic_enabled?
      true
    end

    def constraints
      {}
    end

    private

    attr_reader :phase

    def start_page_field(custom_form)
      CustomField.new(
        id: SecureRandom.uuid,
        key: 'page1',
        resource: custom_form,
        input_type: 'page',
        page_layout: 'default'
      )
    end

    def end_page_field(custom_form, multiloc_service)
      CustomField.new(
        id: SecureRandom.uuid,
        key: 'survey_end',
        resource: custom_form,
        input_type: 'page',
        page_layout: 'default',
        title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
        description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3')
      )
    end

    def follow_project_on_idea_submission?
      true
    end
  end
end
