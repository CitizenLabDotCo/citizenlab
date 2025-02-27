# frozen_string_literal: true

module ParticipationMethod
  class Proposals < Ideation
    def self.method_str
      'proposals'
    end

    def assign_defaults_for_phase
      super
      phase.reacting_dislike_enabled = false
      phase.expire_days_limit ||= 90
      phase.reacting_threshold ||= 300
      phase.prescreening_enabled ||= false
    end

    def allowed_extra_field_input_types
      %w[section number linear_scale rating text multiline_text select multiselect multiselect_image ranking matrix_linear_scale]
    end

    def constraints
      result = {
        ideation_section1: { locks: { enabled: true, title_multiloc: true } },
        title_multiloc: { locks: { enabled: true, required: true, title_multiloc: true } },
        body_multiloc: { locks: { enabled: true, required: true, title_multiloc: true } },
        idea_images_attributes: { locks: { enabled: true, title_multiloc: true } },
        idea_files_attributes: { locks: { title_multiloc: true } },
        topic_ids: { locks: { title_multiloc: true } },
        location_description: { locks: { title_multiloc: true } }
      }
      result[:proposed_budget] = { locks: { title_multiloc: true } } if proposed_budget_in_form?
      result
    end

    # NOTE: This is only ever used by the analyses controller - otherwise the front-end always persists the form
    def create_default_form!
      context = transitive? ? phase.project : phase
      form = CustomForm.create(participation_context: context)

      default_fields(form).reverse_each do |field|
        field.save!
        field.move_to_top
      end

      form
    end

    def default_fields(custom_form)
      multiloc_service = MultilocService.new
      fields = [
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'section',
          code: 'ideation_section1',
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
      if proposed_budget_in_form?
        fields << CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'proposed_budget',
          code: 'proposed_budget',
          input_type: 'number',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.proposed_budget.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.proposed_budget.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: false,
          ordering: 9,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        )
      end

      if cosponsors_in_form?
        fields << CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          key: 'cosponsor_ids',
          code: 'cosponsor_ids',
          input_type: 'cosponsor_ids',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.consponsor_ids.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.consponsor_ids.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: false,
          ordering: proposed_budget_in_form? ? 10 : 9,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        )
      end
      fields
    end

    def budget_in_form?(_)
      false
    end

    def cosponsors_in_form?
      true
    end

    def supports_automated_statuses?
      true
    end

    def supports_serializing?(attribute)
      %i[expire_days_limit reacting_threshold].include?(attribute)
    end

    def supports_serializing_input?(attribute)
      %i[expires_at reacting_threshold].include?(attribute)
    end

    def transitive?
      false
    end

    def use_reactions_as_votes?
      true
    end

    def default_input_term
      'proposal'
    end

    private

    def proposed_budget_in_form?
      false
    end
  end
end
