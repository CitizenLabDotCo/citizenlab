class IdeaCustomFieldsService
  def all_fields(custom_form, options = {})
    default_fields(custom_form)
  end

  private

  def default_fields(custom_form)
    ml_s = MultilocService.new
    [
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'title',
        code: 'title',
        input_type: 'text',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.title.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.title.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue
            {}
          end,
        required: true,
        enabled: true,
        ordering: 0
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'body',
        code: 'body',
        input_type: 'multiline_text',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.body.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.body.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue
            {}
          end,
        required: true,
        enabled: true,
        ordering: 1
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
                                rescue
                                  {}
                                end,
          required: false,
          enabled: false,
          ordering: 2
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
          rescue
            {}
          end,
        required: false,
        enabled: true,
        ordering: 3
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'location',
        code: 'location',
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
          rescue
            {}
          end,
        required: false,
        enabled: true,
        ordering: 4
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'images',
        code: 'images',
        input_type: 'files',
        title_multiloc: ml_s.i18n_to_multiloc(
          'custom_fields.ideas.images.title',
          locales: CL2_SUPPORTED_LOCALES
        ),
        description_multiloc: begin
            ml_s.i18n_to_multiloc(
              'custom_fields.ideas.images.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue
            {}
          end,
        required: false,
        enabled: true,
        ordering: 5
      ),
      CustomField.new(
        id: SecureRandom.uuid,
        resource: custom_form,
        key: 'attachments',
        code: 'attachments',
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
          rescue
            {}
          end,
        required: false,
        enabled: true,
        ordering: 6
      ),
    ]
  end
end

IdeaCustomFieldsService.prepend_if_ee('IdeaCustomFields::Patches::IdeaCustomFieldsService')
