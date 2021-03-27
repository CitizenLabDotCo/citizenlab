class IdeaCustomFieldService

  def db_and_built_in_fields custom_form, custom_fields_scope: nil
    db_cfs = custom_form.custom_fields
    db_cfs = db_cfs.merge(custom_fields_scope) if custom_fields_scope

    bi_cfs = build_built_in_fields(custom_form)
    bi_codes = bi_cfs.map(&:code)

    replacing, additional = db_cfs.partition{|c| bi_codes.include? c.code}

    [
      *build_built_in_fields(custom_form).map do |bi_cf|
        replacing.find{|c| bi_cf.code == c.code} || bi_cf
      end,
      *additional
    ]
  end

  def find_or_build_field custom_form, code
    custom_form&.custom_fields&.find_by(code: code) ||
      build_built_in_fields(custom_form).find{|bicf| bicf.code == code}
  end

  private
    
  def build_built_in_fields custom_form
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
        enabled: true
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
        enabled: true
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
          enabled: false
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
        enabled: true
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
        enabled: true
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
        enabled: true
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
        enabled: true
      ),
    ]
  end
end
