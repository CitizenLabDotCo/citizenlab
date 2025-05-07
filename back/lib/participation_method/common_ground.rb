# frozen_string_literal: true

module ParticipationMethod
  class CommonGround < Base
    def self.method_str
      'common_ground'
    end

    # Reactions are used for voting.
    def supports_reacting?
      true
    end

    def built_in_title_required?
      true
    end

    def assign_defaults(input)
      # The common ground participation method does not use the idea status, but all
      # inputs must have one. We are using the same default as for ideation.
      input.idea_status ||= IdeaStatus.find_by!(code: 'proposed', participation_method: 'ideation')
    end

    def default_fields(custom_form)
      multiloc_service = MultilocService.new

      [
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
          ordering: 0,
          answer_visible_to: CustomField::VISIBLE_TO_PUBLIC
        )
      ]
    end
  end
end
