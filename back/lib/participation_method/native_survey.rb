# frozen_string_literal: true

module ParticipationMethod
  class NativeSurvey < Base
    # Survey responses do not have a fixed field that can be used
    # to generate a slug, so use the id as the basis for the slug.
    # This method is invoked after creation of the input,
    # so store the new slug.
    def assign_slug(input)
      new_slug = SlugService.new.generate_slug input, input.id
      input.update_column :slug, new_slug
    end

    def assign_defaults(input)
      input.publication_status = 'published'
      input.idea_status = IdeaStatus.find_by!(code: 'proposed')
    end

    def create_default_form!
      form = CustomForm.create(participation_context: participation_context)
      field = CustomField.create(
        resource: form,
        input_type: 'select',
        title_multiloc: MultilocService.new.i18n_to_multiloc('form_builder.default_select_field.title')
      )
      CustomFieldOption.create(
        custom_field: field,
        key: 'option1',
        title_multiloc: MultilocService.new.i18n_to_multiloc('form_builder.default_select_field.option1')
      )
      CustomFieldOption.create(
        custom_field: field,
        key: 'option2',
        title_multiloc: MultilocService.new.i18n_to_multiloc('form_builder.default_select_field.option2')
      )
      participation_context.reload
    end

    def never_show?
      true
    end

    def never_update?
      true
    end

    def form_in_phase?
      participation_context.project.timeline?
    end

    def edit_custom_form_allowed?
      participation_context.ideas_count.zero?
    end

    def delete_inputs_on_pc_deletion?
      true
    end

    def supports_toxicity_detection?
      false
    end

    def include_data_in_email?
      false
    end

    # The "Additional information" category in the UI should be suppressed.
    # As long as the form builder does not support sections/categories,
    # we can suppress the heading by returning nil.
    def extra_fields_category_translation_key
      nil
    end
  end
end
