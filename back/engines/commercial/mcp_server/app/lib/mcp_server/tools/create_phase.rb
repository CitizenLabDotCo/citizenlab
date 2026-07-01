# frozen_string_literal: true

class McpServer::Tools::CreatePhase < McpServer::BaseTool
  # Mirrors the participation method picker in the admin UI.
  # participation method value => feature flag name
  GATED_METHODS = {
    'common_ground' => 'common_ground',
    'document_annotation' => 'konveio_document_annotation',
    'poll' => 'polls',
    'survey' => 'surveys'
  }.freeze

  UNGATED_METHODS = %w[
    ideation
    proposals
    information
    native_survey
    voting
    volunteering
  ].freeze

  def name = 'create_phase'

  def annotations
    {
      read_only_hint: false,
      destructive_hint: false,
      idempotent_hint: false,
      open_world_hint: false
    }
  end

  def description
    <<~DESC.squish
      Creates a new phase for a project. Some fields are conditionally required
      based on participation_method — see each field's description.
    DESC
  end

  def input_schema
    {
      properties: {
        project_id: { type: 'string', description: 'The ID of the project' },
        title_multiloc: { **multiloc_schema, description: 'Phase title.' },
        description_multiloc: { **multiloc_schema, description: 'Phase description (HTML).' },
        start_at: { type: 'string', description: 'Phase start date (ISO 8601 format)' },
        end_at: {
          type: 'string',
          description: <<~DESC.squish
            Phase end date (ISO 8601 format). Optional on the last phase,
            which then runs indefinitely.
          DESC
        },
        participation_method: {
          type: 'string',
          enum: available_participation_methods,
          description: "Participation method. Default: #{phase_default('participation_method')}."
        },

        # Participation toggles (apply to phases with inputs: ideation, proposals, voting, common_ground, native_survey)
        submission_enabled: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether participants can submit inputs.
            Default: #{phase_default('submission_enabled')}.
          DESC
        },
        commenting_enabled: {
          type: 'boolean',
          description: "Whether participants can comment. Default: #{phase_default('commenting_enabled')}."
        },
        allow_anonymous_participation: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether participants can post inputs and comments anonymously.
            Default: #{phase_default('allow_anonymous_participation')}.
          DESC
        },

        # Reactions (ideation, proposals, common_ground)
        reacting_enabled: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether participants can react (like/dislike).
            Default: #{phase_default('reacting_enabled')}.
          DESC
        },
        reacting_like_method: {
          type: 'string',
          enum: Phase::REACTING_METHODS,
          description: <<~DESC.squish
            'limited' caps each participant at `reacting_like_limited_max` likes for this phase;
            'unlimited' has no cap. Default: '#{phase_default('reacting_like_method')}'.
          DESC
        },
        reacting_like_limited_max: {
          type: 'integer',
          description: <<~DESC.squish
            Per-participant like cap. Only used when `reacting_like_method` is 'limited'.
            Default: #{phase_default('reacting_like_limited_max')}.
          DESC
        },
        **disliking_fields,

        # Input list presentation (ideation, proposals, voting)
        presentation_mode: {
          type: 'string',
          enum: Phase::PRESENTATION_MODES,
          description: <<~DESC.squish
            The view (or presentation mode) used by default to show inputs to visitors.
            Default: '#{phase_default('presentation_mode')}'.
          DESC
        },
        available_views: {
          type: 'array',
          items: { type: 'string', enum: Phase::PRESENTATION_MODES },
          description: <<~DESC.squish
            Views visitors can choose from.
            Must include 'card' and the current `presentation_mode`.
            If omitted, it's auto-filled with those two.
          DESC
        },
        # On voting phases, the only valid value is 'random' and it's auto-filled by the model.
        ideas_order: {
          type: 'string',
          enum: %w[trending random popular -new new comments_count],
          description: 'Default ordering of inputs. Only applies to ideation and proposals phases.'
        },
        input_term: {
          type: 'string',
          enum: Phase::INPUT_TERMS,
          description: <<~DESC.squish
            Noun used to describe an input.
            Only applies to ideation, proposals, and voting phases.
            Default: '#{phase_default('input_term')}'.
          DESC
        },

        # Pre-screening (ideation, proposals; gated by the 'prescreening' /
        # 'prescreening_ideation' / 'flag_inappropriate_content' feature flags)
        prescreening_mode: {
          type: %w[string null],
          enum: prescreening_mode_enum,
          description: <<~DESC
            Which inputs require admin approval before publication:
            - 'all': every input
            - 'flagged_only': only inputs flagged by automated toxicity detection
            - null: none (disabled)
          DESC
        },

        # Proposals-specific
        reacting_threshold: {
          type: 'integer',
          description: <<~DESC.squish
            Number of likes a proposal must gather to be recognized as having enough support.
            Only for 'proposals' phases.
          DESC
        },
        expire_days_limit: {
          type: 'integer',
          description: <<~DESC.squish
            Number of days after publication a proposal has to gather likes before it expires.
            Only for 'proposals' phases.
          DESC
        },

        # Similarity detection (ideation, proposals)
        similarity_enabled: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether to suggest similar inputs during input submission.
            Default: #{phase_default('similarity_enabled')}.
          DESC
        },
        similarity_threshold_title: {
          type: 'number',
          description: <<~DESC.squish
            Similarity threshold for input titles (0–1). Default: #{phase_default('similarity_threshold_title')}.
            Do not set unless the user explicitly asks to tune similarity matching.
          DESC
        },
        similarity_threshold_body: {
          type: 'number',
          description: <<~DESC.squish
            Similarity threshold for input bodies (0–1). Default: #{phase_default('similarity_threshold_body')}.
            Do not set unless the user explicitly asks to tune similarity matching.
          DESC
        },

        # Voting (only for voting phases)
        voting_method: {
          type: 'string',
          enum: Phase::VOTING_METHODS,
          description: <<~DESC
            Type of voting. Required when `participation_method` is 'voting'.
            - 'single_voting': one vote per input; voters can vote on multiple inputs (up to `voting_max_total`)
            - 'multiple_voting': multiple votes per input allowed (up to `voting_max_votes_per_idea`), with `voting_max_total` as the overall cap
            - 'budgeting': each input has a cost; voters allocate a fixed budget (`voting_max_total`) across inputs
          DESC
        },
        vote_term: {
          type: 'string',
          enum: Phase::VOTE_TERMS,
          description: "Noun used for a vote. Only for 'voting' phases. Default: '#{phase_default('vote_term')}'."
        },
        voting_min_total: {
          type: 'integer',
          description: <<~DESC.squish
            Minimum votes (or budget, for 'budgeting') a voter must cast.
            Default: #{phase_default('voting_min_total')}.
          DESC
        },
        voting_max_total: {
          type: 'integer',
          description: <<~DESC.squish
            Maximum votes (or budget, for 'budgeting') a voter can cast.
            Required for 'multiple_voting' and 'budgeting'.
          DESC
        },
        voting_max_votes_per_idea: {
          type: 'integer',
          description: <<~DESC.squish
            Maximum votes a voter can put on the same input. Only meaningful for 'multiple_voting'
            ('single_voting' forces it to 1; 'budgeting' forces it to null).
          DESC
        },
        voting_min_selected_options: {
          type: 'integer',
          description: 'Minimum number of distinct inputs a voter must vote for.'
        },
        voting_filtering_enabled: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether voters can filter the input list (by search, topic, etc.) during voting.
            Default: #{phase_default('voting_filtering_enabled')}.
          DESC
        },
        autoshare_results_enabled: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether voting results are auto-shared. Only for 'voting' phases.
            Default: #{phase_default('autoshare_results_enabled')}.
          DESC
        },

        # Native survey (in-platform survey)
        native_survey_title_multiloc: {
          **multiloc_schema,
          description: <<~DESC.squish
            Title of the native survey. Required when `participation_method` is 'native_survey'.
          DESC
        },
        native_survey_button_multiloc: {
          **multiloc_schema,
          description: <<~DESC.squish
            Call-to-action button text for the native survey.
            Required when `participation_method` is 'native_survey'.
          DESC
        },

        # External survey
        survey_embed_url: {
          type: 'string',
          description: "Embed URL of an external survey. Only for 'survey' phases."
        },
        survey_service: {
          type: 'string',
          enum: Surveys::SurveyPhase::SURVEY_SERVICES,
          description: "External survey provider. Only for 'survey' phases."
        },

        # Poll
        poll_anonymous: {
          type: 'boolean',
          description: <<~DESC.squish
            Whether poll answers are anonymous. Only for 'poll' phases.
            Default: #{phase_default('poll_anonymous')}.
          DESC
        },

        # Document annotation (Konveio)
        document_annotation_embed_url: {
          type: 'string',
          description: <<~DESC.squish
            Konveio embed URL (https://*.konveio.{com,site,net}/...).
            Only for 'document_annotation' phases.
          DESC
        },

        manual_voters_amount: { type: 'integer', description: 'Count of offline/manually-recorded voters. Only for voting phases.' }
      },
      required: %w[project_id title_multiloc start_at]
    }
  end

  class Runner < McpServer::BaseTool::Runner
    def run
      phase = Phase.new(**params)
      authorize_project!(phase.project)
      authorize(phase, :create?)

      SideFxPhaseService.new.before_create(phase, current_user)
      phase.save!
      SideFxPhaseService.new.after_create(phase, current_user)

      ok(
        "Created phase #{phase.id}",
        structured: phase.as_json(only: %i[id project_id title_multiloc start_at end_at participation_method])
      )
    rescue ActiveRecord::RecordInvalid => e
      error("Validation failed: #{e.record.errors.full_messages.join(', ')}")
    end
  end

  private

  def available_participation_methods
    config = AppConfiguration.instance
    enabled_gated = GATED_METHODS.select { |_, flag| config.feature_activated?(flag) }.keys
    (UNGATED_METHODS + enabled_gated) & Phase::PARTICIPATION_METHODS
  end

  def prescreening_mode_enum
    # TODO: It does not take the actual participation method into account.
    config = AppConfiguration.instance
    return [nil] unless config.feature_activated?('prescreening') || config.feature_activated?('prescreening_ideation')

    modes = [nil, 'all']
    modes << 'flagged_only' if config.feature_activated?('flag_inappropriate_content')
    modes
  end

  def disliking_fields
    return {} unless AppConfiguration.instance.feature_activated?('disable_disliking')

    {
      reacting_dislike_enabled: {
        type: 'boolean',
        description: <<~DESC.squish
          Whether participants can dislike.
          Default: #{phase_default('reacting_dislike_enabled')}.
        DESC
      },
      reacting_dislike_method: {
        type: 'string',
        enum: Phase::REACTING_METHODS,
        description: <<~DESC.squish
          'limited' caps each participant at `reacting_dislike_limited_max` dislikes for this phase;
          'unlimited' has no cap. Default: '#{phase_default('reacting_dislike_method')}'.
        DESC
      },
      reacting_dislike_limited_max: {
        type: 'integer',
        description: <<~DESC.squish
          Per-participant dislike cap. Only used when `reacting_dislike_method` is 'limited'.
          Default: #{phase_default('reacting_dislike_limited_max')}.
        DESC
      }
    }
  end

  def phase_default(column_name)
    Phase.columns_hash[column_name].default
  end
end
