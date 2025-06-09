# frozen_string_literal: true

module ParticipationMethod
  class Ideation < Base
    ALLOWED_EXTRA_FIELD_TYPES = %w[
      page number linear_scale rating text multiline_text select multiselect multiselect_image
      ranking sentiment_linear_scale matrix_linear_scale
    ]

    def self.method_str
      'ideation'
    end

    def additional_export_columns
      %w[manual_votes]
    end

    def allowed_extra_field_input_types
      ALLOWED_EXTRA_FIELD_TYPES
    end

    def allowed_ideas_orders
      %w[trending random popular -new new comments_count]
    end

    def assign_defaults(input)
      input_status_code = phase&.prescreening_enabled ? 'prescreening' : 'proposed'
      input.idea_status ||= IdeaStatus.find_by!(code: input_status_code, participation_method: idea_status_method)
      input.publication_status ||= input.idea_status.public_post? ? 'published' : 'submitted'
    end

    def assign_defaults_for_phase
      phase.ideas_order ||= 'trending' if allowed_ideas_orders.include?('trending')
      phase.input_term ||= default_input_term if supports_input_term?
      phase.similarity_threshold_title ||= 0.3
      phase.similarity_threshold_body ||= 0.4
    end

    def author_in_form?(user)
      AppConfiguration.instance.feature_activated?('idea_author_change') \
      && !!user \
      && UserRoleService.new.can_moderate_project?(phase.project, user)
    end

    def budget_in_form?(user)
      phase.project.phases.any? do |phase|
        phase.participation_method == 'voting' && Factory.instance.voting_method_for(phase).budget_in_form?(user)
      end
    end

    def cosponsors_in_form?
      false
    end

    # Locks mirror the name of the fields whose default values cannot be changed (ie are locked)
    def constraints
      result = {
        title_page: { locks: { enabled: true, title_multiloc: true } },
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
          input_type: 'page',
          page_layout: 'default',
          code: 'title_page',
          key: nil,
          title_multiloc: {},
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.title_page.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 0
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
          ordering: 1
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default',
          code: 'body_page',
          key: nil,
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.body_page.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.body_page.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 2
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
          ordering: 3
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default',
          code: 'uploads_page',
          key: nil,
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.uploads_page.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.uploads_page.description',
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
          ordering: 5
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
          ordering: 6
        ),
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default',
          code: 'details_page',
          key: nil,
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'custom_fields.ideas.details_page.title',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: begin
            multiloc_service.i18n_to_multiloc(
              'custom_fields.ideas.details_page.description',
              locales: CL2_SUPPORTED_LOCALES
            )
          rescue StandardError
            {}
          end,
          required: false,
          enabled: true,
          ordering: 7
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
          ordering: 8
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
          ordering: 9
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
          ordering: 10
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
          ordering: proposed_budget_in_form? ? 11 : 10
        )
      end

      # Add the final form end page field
      fields << CustomField.new(
        id: SecureRandom.uuid,
        key: 'form_end',
        resource: custom_form,
        input_type: 'page',
        page_layout: 'default',
        title_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.title_text_3'),
        description_multiloc: multiloc_service.i18n_to_multiloc('form_builder.form_end_page.description_text_3'),
        include_in_printed_form: false
      )

      fields
    end

    def generate_slug(input)
      title = MultilocService.new.t(input.title_multiloc, input.author&.locale).presence
      SlugService.new.generate_slug input, title
    end

    def supports_answer_visible_to?
      true
    end

    def supports_assignment?
      true
    end

    def built_in_title_required?
      true
    end

    def built_in_body_required?
      true
    end

    def supports_commenting?
      true
    end

    def supports_exports?
      true
    end

    def supports_private_attributes_in_export?
      true
    end

    def supports_input_term?
      true
    end

    def default_input_term
      'idea'
    end

    def supports_inputs_without_author?
      false
    end

    def supports_public_visibility?
      true
    end

    def supports_reacting?
      true
    end

    def supports_status?
      true
    end

    def supports_submission?
      true
    end

    def transitive?
      true
    end

    def follow_idea_on_idea_submission?
      true
    end

    def automatically_assign_idea?
      true
    end

    def add_autoreaction_to_inputs?
      true
    end

    private

    def proposed_budget_in_form?
      true
    end
  end
end
