module Permissions
  class IdeaPermissionsService < ProjectPermissionsService
    IDEA_DENIED_REASONS = {
      idea_not_in_current_phase: 'idea_not_in_current_phase'
    }.freeze

    def initialize(idea, user, user_requirements_service: nil)
      super(idea.project, user, user_requirements_service: user_requirements_service)
      @idea ||= idea
    end

    def denied_reason_for_action(action, reaction_mode: nil)
      reason = super
      return reason if reason

      current_phase = @timeline_service.current_phase_not_archived project
      if current_phase && !idea_in_current_phase?(current_phase)
        IDEA_DENIED_REASONS[:idea_not_in_current_phase]
      end
    end

    def denied_reason_for_reaction_mode(reaction_mode)
      denied_reason_for_action('reacting_idea', reaction_mode: reaction_mode)
    end

    def action_descriptors
      commenting_disabled_reason = denied_reason_for_action 'commenting_idea'
      liking_disabled_reason = denied_reason_for_action 'reacting_idea', reaction_mode: 'up'
      disliking_disabled_reason = denied_reason_for_action 'reacting_idea', reaction_mode: 'down'
      cancelling_reactions_disabled_reason = denied_reason_for_action 'reacting_idea'
      voting_disabled_reason = denied_reason_for_action 'voting'
      comment_reacting_disabled_reason = commenting_disabled_reason

      {
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

    private

    attr_reader :idea

    def idea_in_current_phase?(current_phase)
      idea.ideas_phases.find { |ip| ip.phase_id == current_phase.id }
    end
  end
end
