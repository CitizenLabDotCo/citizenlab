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

    def supports_exports?
      true
    end

    def supports_private_attributes_in_export?
      true
    end

    def supports_submission?
      true
    end

    def supports_edits_after_publication?
      true
    end

    def supports_inputs_without_author?
      false
    end

    def use_reactions_as_votes?
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
          ordering: 1,
          min_characters: 3,
          max_characters: 120
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

    def participations
      # Events are not associated with phase, so attending_event not included at phase-level.
      {
        posting_idea: participation_ideas_published,
        reacting_idea: participation_idea_reactions
      }
    end

    def participation_ideas_published
      end_time = phase.end_at ? phase.end_at.end_of_day : Time.current.end_of_day
      ideas = phase.ideas
        .transitive(false)
        .where.not(published_at: nil)
        .where(<<~SQL.squish, phase.start_at.beginning_of_day, end_time)
          ideas.created_at >= ? AND ideas.created_at <= ?
          AND ideas.publication_status = 'published'
        SQL
        .includes(:author)

      ideas.map do |idea|
        {
          item_id: idea.id,
          action: 'posting_idea',
          acted_at: idea.published_at, # analytics_fact_participations uses created_at, so maybe we should use that here too?
          classname: 'Idea',
          participant_id: participant_id(idea.id, idea.author_id, idea.author_hash),
          user_custom_field_values: idea&.author&.custom_field_values || {}
        }
      end
    end

    # Cloned from ParticipationMethod::Ideation, since we can't inherit from it directly
    def participation_idea_reactions
      end_time = phase.end_at ? phase.end_at.end_of_day : Time.current.end_of_day
      reactions = Reaction.where(
        reactable_type: 'Idea',
        reactable_id: phase.ideas.select(:id),
        created_at: phase.start_at.beginning_of_day..end_time
      ).includes(:user)

      reactions.map do |reaction|
        {
          item_id: reaction.id,
          action: 'reacting_idea',
          acted_at: reaction.created_at,
          classname: 'Reaction',
          participant_id: participant_id(reaction.id, reaction.user_id),
          user_custom_field_values: reaction&.user&.custom_field_values || {}
        }
      end
    end

    private

    delegate :i18n_to_multiloc, to: :multiloc_service

    def multiloc_service
      @multiloc_service ||= MultilocService.new
    end
  end
end
