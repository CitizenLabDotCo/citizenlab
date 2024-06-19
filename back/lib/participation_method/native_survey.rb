# frozen_string_literal: true

module ParticipationMethod
  class NativeSurvey < Base
    def assign_defaults_for_phase
      phase.posting_method = 'limited'
      phase.posting_limited_max = 1
    end

    # Survey responses do not have a fixed field that can be used
    # to generate a slug, so use the id as the basis for the slug.
    def generate_slug(input)
      input.id ||= SecureRandom.uuid # Generate the ID if the input is not persisted yet.
      SlugService.new.generate_slug input, input.id
    end

    def assign_defaults(input)
      input.publication_status = 'published'
      input.idea_status = IdeaStatus.find_by!(code: 'proposed')
    end

    def form_structure_element
      'page'
    end

    def default_fields(custom_form)
      return [] if custom_form.persisted?

      multiloc_service = MultilocService.new
      [
        CustomField.new(
          id: SecureRandom.uuid,
          key: 'page1',
          resource: custom_form,
          input_type: 'page'
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          key: CustomFieldService.new.generate_key(
            multiloc_service.i18n_to_multiloc('form_builder.default_select_field.title').values.first,
            false
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
        )
      ]
    end

    def allowed_extra_field_input_types
      %w[page number linear_scale text multiline_text select multiselect multiselect_image file_upload point]
    end

    # NOTE: This is only ever used by the analyses controller - otherwise the front-end always persists the form
    def create_default_form!
      form = CustomForm.new(participation_context: phase)

      default_fields(form).reverse_each do |field|
        field.save!
        field.move_to_top
      end

      form.save!
      phase.reload

      form
    end

    def never_show?
      true
    end

    def posting_allowed?
      true
    end

    def update_if_published?
      false
    end

    def creation_phase?
      true
    end

    def custom_form
      phase.custom_form || CustomForm.new(participation_context: phase)
    end

    def edit_custom_form_allowed?
      true
    end

    def delete_inputs_on_pc_deletion?
      true
    end

    def supports_exports?
      true
    end

    def supports_toxicity_detection?
      false
    end

    def supports_survey_form?
      true
    end

    def supports_permitted_by_everyone?
      true
    end

    def include_data_in_email?
      false
    end

    def return_disabled_actions?
      true
    end

    # The "Additional information" category in the UI should be suppressed.
    # As long as the form builder does not support sections/categories,
    # we can suppress the heading by returning nil.
    def extra_fields_category_translation_key
      nil
    end
  end
end
