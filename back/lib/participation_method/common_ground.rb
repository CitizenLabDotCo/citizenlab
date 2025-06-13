# frozen_string_literal: true

module ParticipationMethod
  class CommonGround < Base
    SUPPORTED_REACTION_MODES = %w[up down neutral].freeze

    def self.method_str
      'common_ground'
    end

    def built_in_title_required?
      true
    end

    def assign_defaults_for_phase
      phase.reacting_dislike_enabled = true
      phase.input_term = 'contribution'
    end

    def assign_defaults(input)
      # The common ground participation method does not use the idea status, but all
      # inputs must have one. We are using the same default as for ideation.
      input.idea_status ||= IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')
    end

    # This is necessary in order to be able to retrieve the inputs using the +IdeasFinder+
    # class, which excludes inputs that aren't publicly visible. While this isn't a great
    # reason to set the flag to true, it doesn't cause too much harm. The main issue with
    # this approach is that it makes the ideas indexable, even though we don't necessarily
    # want the users to be able to bypass the routing logic of the Common Ground
    # participation method and access the ideas directly.
    # [TODO] The behaviour of the +IdeasFinder+ class could potentially be reworked.
    def supports_public_visibility?
      true
    end

    def default_fields(custom_form)
      [
        CustomField.new(
          id: SecureRandom.uuid,
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default',
          code: 'title_page',
          key: 'page1',
          title_multiloc: {},
          description_multiloc: i18n_to_multiloc(
            'custom_fields.ideas.title_page.description',
            locales: CL2_SUPPORTED_LOCALES,
            raise_on_missing: false
          ),
          required: false,
          enabled: true,
          ordering: 0
        ),

        # Inputs in common ground phases are essentially short statements, so we have no
        # use for a body at the moment. We'll probably reconsider this depending on what
        # comes out of user feedback and usage.
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
          description_multiloc: {},
          required: true,
          enabled: true,
          ordering: 1
        ),

        CustomField.new(
          id: SecureRandom.uuid,
          key: 'form_end',
          resource: custom_form,
          input_type: 'page',
          page_layout: 'default',
          title_multiloc: multiloc_service.i18n_to_multiloc(
            'form_builder.form_end_page.title_text_3',
            locales: CL2_SUPPORTED_LOCALES
          ),
          description_multiloc: multiloc_service.i18n_to_multiloc(
            'form_builder.form_end_page.description_text_3',
            locales: CL2_SUPPORTED_LOCALES
          ),
          include_in_printed_form: false,
          enabled: true,
          required: false,
          ordering: 2
        )
      ]
    end

    private

    delegate :i18n_to_multiloc, to: :multiloc_service

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
