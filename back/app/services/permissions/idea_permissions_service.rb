module Permissions
  class IdeaPermissionsService < PhasePermissionsService
    IDEA_DENIED_REASONS = {
      idea_not_in_current_phase: 'idea_not_in_current_phase',
      votes_exist: 'votes_exist',
      published_after_screening: 'published_after_screening',
      not_author: 'not_author',
      reacting_not_allowed: 'reacting_not_allowed'
    }.freeze

    REACTING_NOT_ALLOWED_CODES = %w[prescreening expired ineligible].freeze

    def initialize(idea, user, user_requirements_service: nil)
      @idea = idea
      super(permission_phase, user, user_requirements_service:)
    end

    def denied_reason_for_action(action, reaction_mode: nil, delete_action: false)
      case action
      when 'reacting_idea'
        # Checked before anything signing in could resolve, so the frontend
        # never sends a user through an authentication flow for an impossible
        # action.
        return IDEA_DENIED_REASONS[:reacting_not_allowed] if reacting_not_allowed?
      when 'editing_idea'
        return editing_idea_denied_reason
      end

      if !phase
        reason = no_active_phase_reason
        # Moderators can act on inputs outside the current phase, but the
        # project state still binds them.
        return if moderator? && reason == IDEA_DENIED_REASONS[:idea_not_in_current_phase]

        return reason
      end

      super
    end

    def denied_reason_for_reaction_mode(reaction_mode, delete_action: false)
      denied_reason_for_action('reacting_idea', reaction_mode: reaction_mode, delete_action: delete_action)
    end

    def action_descriptors
      editing_disabled_reason = denied_reason_for_action 'editing_idea'
      commenting_disabled_reason = denied_reason_for_action 'commenting_idea'
      liking_disabled_reason = denied_reason_for_action 'reacting_idea', reaction_mode: 'up'
      disliking_disabled_reason = denied_reason_for_action 'reacting_idea', reaction_mode: 'down'
      cancelling_reactions_disabled_reason = denied_reason_for_action 'reacting_idea'
      voting_disabled_reason = denied_reason_for_action 'voting'
      comment_reacting_disabled_reason = commenting_disabled_reason

      {
        editing_idea: {
          enabled: !editing_disabled_reason,
          disabled_reason: editing_disabled_reason,
          future_enabled_at: editing_disabled_reason && future_enabled_phase('editing_idea')&.start_at
        },
        commenting_idea: {
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason,
          future_enabled_at: commenting_disabled_reason && future_enabled_phase('commenting_idea')&.start_at
        },
        reacting_idea: {
          enabled: !liking_disabled_reason,
          disabled_reason: liking_disabled_reason,
          cancelling_enabled: !cancelling_reactions_disabled_reason,
          up: {
            enabled: !liking_disabled_reason,
            disabled_reason: liking_disabled_reason,
            future_enabled_at: liking_disabled_reason && future_enabled_phase('reacting_idea', reaction_mode: 'up')&.start_at
          },
          down: {
            enabled: !disliking_disabled_reason,
            disabled_reason: disliking_disabled_reason,
            future_enabled_at: disliking_disabled_reason && future_enabled_phase('reacting_idea', reaction_mode: 'down')&.start_at
          }
        },
        comment_reacting_idea: {
          enabled: !comment_reacting_disabled_reason,
          disabled_reason: comment_reacting_disabled_reason,
          future_enabled_at: comment_reacting_disabled_reason && future_enabled_phase('commenting_idea')&.start_at
        },
        voting: {
          enabled: !voting_disabled_reason,
          disabled_reason: voting_disabled_reason,
          future_enabled_at: voting_disabled_reason && future_enabled_phase('voting')&.start_at
        }
      }
    end

    def editing_phase
      phase || (current_phase if !standalone_input?)
    end

    private

    attr_reader :idea

    def permission_phase
      phase = idea.active_phase
      phase.project = idea.project if phase # Performance optimization (keep preloaded relationships)
      phase
    end

    # Editing deviates from the shared order: only the author edits their own
    # input, moderators edit any input, and a timeline input stays editable
    # after its phase ended, governed by the project's current phase.
    def editing_idea_denied_reason
      return if moderator?
      return IDEA_DENIED_REASONS[:not_author] if !author?

      reason = editing_phase_denied_reason
      return reason if reason
      return IDEA_DENIED_REASONS[:votes_exist] if idea.participation_method_on_creation.use_reactions_as_votes? && idea.reactions.where.not(user_id: user&.id).exists?

      IDEA_DENIED_REASONS[:published_after_screening] if idea.creation_phase_with_fallback&.prescreening_all? && idea.published?
    end

    def editing_phase_denied_reason
      return no_active_phase_reason if !editing_phase

      PhasePermissionsService.new(editing_phase, user, user_requirements_service:).denied_reason_for_action('editing_idea')
    end

    def no_active_phase_reason
      project_reason = project_denied_reason(idea.project)
      return project_reason if project_reason
      return PHASE_DENIED_REASONS[:inactive_phase] if standalone_input?
      return IDEA_DENIED_REASONS[:idea_not_in_current_phase] if current_phase

      PROJECT_DENIED_REASONS[:project_inactive]
    end

    def standalone_input?
      idea.creation_phase && !idea.creation_phase.placement_strategy.sequential?
    end

    def moderator?
      user && UserRoleService.new.can_moderate_project?(idea.project, user)
    end

    def author?
      !!user&.active? && idea.author_id == user.id
    end

    def current_phase
      return @current_phase if defined?(@current_phase)

      @current_phase = timeline_service.current_phase_not_archived(idea.project)
      @current_phase.project = idea.project if @current_phase
      @current_phase
    end

    def future_enabled_phase(action, reaction_mode: nil)
      return if standalone_input?

      time = Time.zone.now
      timeline_service.future_phases(idea.project, time).find do |phase|
        !PhasePermissionsService.new(phase, user, user_requirements_service: user_requirements_service, time: nil).denied_reason_for_action(action, reaction_mode: reaction_mode)
      end
    end

    def reacting_not_allowed?
      idea.voting_expired? || REACTING_NOT_ALLOWED_CODES.include?(idea&.idea_status&.code)
    end

    def timeline_service
      @timeline_service ||= TimelineService.new
    end
  end
end
