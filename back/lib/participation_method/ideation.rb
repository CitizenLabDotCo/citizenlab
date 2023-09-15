# frozen_string_literal: true

module ParticipationMethod
  class Ideation < Base
    def assign_defaults_for_participation_context
      participation_context.ideas_order ||= 'trending'
    end

    # This method is invoked after creation of the input,
    # so store the new slug.
    def assign_slug(input)
      title = MultilocService.new.t input.title_multiloc, input.author&.locale
      new_slug = SlugService.new.generate_slug input, title
      input.update_column :slug, new_slug
    end

    def assign_defaults(input)
      input.idea_status ||= IdeaStatus.find_by!(code: 'proposed')
    end

    def default_fields(custom_form)
      multiloc_service = MultilocService.new
      [
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
        ),
        CustomField.new(
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
      ]
    end

    # Locks mirror the name of the fields whose default values cannot be changed (ie are locked)
    def constraints
      {
        ideation_section1: { locks: { enabled: true, title_multiloc: true } },
        title_multiloc: { locks: { enabled: true, required: true, title_multiloc: true } },
        body_multiloc: { locks: { enabled: true, required: true, title_multiloc: true } },
        idea_images_attributes: { locks: { enabled: true, title_multiloc: true } },
        idea_files_attributes: { locks: { title_multiloc: true } },
        topic_ids: { locks: { title_multiloc: true } },
        location_description: { locks: { title_multiloc: true } },
        proposed_budget: { locks: { title_multiloc: true } }
      }
    end

    def form_structure_element
      'section'
    end

    def auto_create_default_form?
      false
    end

    def create_default_form!
      form = CustomForm.create(participation_context: participation_context)

      default_fields(form).reverse_each do |field|
        field.save!
        field.move_to_top
      end

      participation_context.reload

      form
    end

    def validate_built_in_fields?
      true
    end

    def author_in_form?(user)
      AppConfiguration.instance.feature_activated?('idea_author_change') \
      && !!user \
      && UserRoleService.new.can_moderate_project?(participation_context.project, user)
    end

    def budget_in_form?(user)
      return false if participation_context.project.continuous?

      participation_context.project.phases.any? do |phase|
        phase.voting? && Factory.instance.voting_method_for(phase).budget_in_form?(user)
      end
    end

    def allowed_ideas_orders
      %w[trending random popular -new new]
    end

    def posting_allowed?
      true
    end

    def supports_exports?
      true
    end

    def supports_publication?
      true
    end

    def supports_commenting?
      true
    end

    def supports_reacting?
      true
    end

    def supports_status?
      true
    end

    def supports_assignment?
      true
    end

    def sign_in_required_for_posting?
      true
    end

    def supports_answer_visible_to?
      true
    end

    def supports_idea_form?
      true
    end
  end
end
