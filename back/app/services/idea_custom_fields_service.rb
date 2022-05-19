# frozen_string_literal: true

class IdeaCustomFieldsService
  def all_fields(custom_form, _options = {})
    default_fields(custom_form)
  end

  def allowed_custom_field_keys(custom_form)
    enabled_extra_fields = all_fields(custom_form).find_all do |field|
      !field.built_in? && field.enabled && !field.hidden
    end
    fields_with_array_keys, fields_with_simple_keys = enabled_extra_fields.partition do |field|
      field.input_type == 'multiselect'
    end
    [
      *fields_with_simple_keys.map(&:key).map(&:to_sym),
      fields_with_array_keys.map(&:key).map(&:to_sym).index_with { |_k| [] }
    ]
  end

  private

  def default_fields(custom_form)
    ml_s = MultilocService.new
    [
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'title_multiloc',
        code: 'title_multiloc',
        input_type: 'text_multiloc',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.title.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.title.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: true,
        enabled: true,
        ordering: 1
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'body_multiloc',
        code: 'body_multiloc',
        input_type: 'html_multiloc',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.body.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.body.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: true,
        enabled: true,
        ordering: 2
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'author_id',
        code: 'author_id',
        input_type: 'text',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.author_id.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.author_id.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: false,
        enabled: true,
        ordering: 3
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'budget',
        code: 'budget',
        input_type: 'number',
        title_multiloc: ml_s.i18n_to_multiloc(
            'custom_fields.ideas.budget.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
        description_multiloc: begin
                                ml_s.i18n_to_multiloc(
                                  'custom_fields.ideas.budget.description',
                                  locales: CL2_SUPPORTED_LOCALES
                                )
        rescue StandardError
                                {}
        end,
        required: false,
        enabled: true,
        ordering: 4
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'proposed_budget',
        code: 'proposed_budget',
        input_type: 'number',
        title_multiloc: ml_s.i18n_to_multiloc(
            'custom_fields.ideas.proposed_budget.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
        description_multiloc: begin
                                ml_s.i18n_to_multiloc(
                                  'custom_fields.ideas.proposed_budget.description',
                                  locales: CL2_SUPPORTED_LOCALES
                                )
        rescue StandardError
                                {}
        end,
        required: false,
        enabled: false,
        ordering: 4
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'topic_ids',
        code: 'topic_ids',
        input_type: 'multiselect',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.topic_ids.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.topic_ids.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: false,
        enabled: true,
        ordering: 5
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'location_description',
        code: 'location_description',
        input_type: 'text',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.location.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.location.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: false,
        enabled: true,
        ordering: 6
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'location_point_geojson',
        code: 'location_point_geojson',
        input_type: 'point',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.location.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.location.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: false,
        hidden: true,
        enabled: true,
        ordering: 7
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'idea_images_attributes',
        code: 'idea_images_attributes',
        input_type: 'image_files',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.images.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.images.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: false,
        enabled: true,
        ordering: 8
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'idea_files_attributes',
        code: 'idea_files_attributes',
        input_type: 'files',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.attachments.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.attachments.description',
              locales: CL2_SUPPORTED_LOCALES
            )
        rescue StandardError
            {}
        end,
        required: false,
        enabled: true,
        ordering: 9
      )
    ]
  end
end

IdeaCustomFieldsService.prepend_if_ee('IdeaCustomFields::Patches::IdeaCustomFieldsService')
