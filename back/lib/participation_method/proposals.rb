# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def transitive?
      false
    end

    # def assign_defaults(_)
    #   super # TODO: default status and publication status
    # end

    def budget_in_form?(_)
      false
    end

    def proposed_budget_in_form?
      false
    end

    # def update_if_published?
    #   super # TODO: if no reviewing and no reactions + toggle
    # end

    # def supports_status?
    #   super # TODO: separate proposal statuses
    # end
    # 
    def default_fields(custom_form)
      multiloc_service = MultilocService.new
      fields = [
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'section',
          code: 'ideas_section1',
          key: nil,
          title_multiloc: {},
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.section1.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 0,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'title_multiloc',
          code: 'title_multiloc',
          input_type: 'text_multiloc',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.title.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.title.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: true,
          enabled: true,
          ordering: 1,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'body_multiloc',
          code: 'body_multiloc',
          input_type: 'html_multiloc',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.body.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.body.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: true,
          enabled: true,
          ordering: 2,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'section',
          code: 'ideation_section2',
          key: nil,
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.section2.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.section2.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 3,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'idea_images_attributes',
          code: 'idea_images_attributes',
          input_type: 'image_files',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.images.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.images.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 4,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'idea_files_attributes',
          code: 'idea_files_attributes',
          input_type: 'files',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.attachments.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.attachments.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 5,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'section',
          code: 'ideation_section3',
          key: nil,
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.section3.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.section3.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 6,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'topic_ids',
          code: 'topic_ids',
          input_type: 'topic_ids',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.topic_ids.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.topic_ids.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 7,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'location_description',
          code: 'location_description',
          input_type: 'text',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.location.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.location.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 8,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        )
      ]
      fields
    end

  end
end
