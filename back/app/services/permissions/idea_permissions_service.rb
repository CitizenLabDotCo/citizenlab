module Permissions
  class IdeaPermissionsService < ProjectPermissionsService
    IDEA_DENIED_REASONS = {
      idea_not_in_current_phase: 'idea_not_in_current_phase'
    }.freeze

    def initialize(idea, user)
      super(user)
      @idea ||= idea
    end

    def denied_reason_for_idea(action, reaction_mode: nil)
      reason = super action, user, idea.project, reaction_mode: reaction_mode
      return reason if reason

      current_phase = @timeline_service.current_phase_not_archived idea.project
      if current_phase && !idea_in_current_phase?(idea, current_phase)
        IDEA_DENIED_REASONS[:idea_not_in_current_phase]
      end
    end

    def denied_reason_for_idea_reaction(reaction, reaction_mode: nil)
      reaction_mode ||= reaction.mode
      denied_reason_for_idea('reacting_idea', reaction_mode: reaction_mode)
    end

    def action_descriptors(idea, user)
      commenting_disabled_reason = denied_reason_for_idea 'commenting_idea'
      liking_disabled_reason = denied_reason_for_idea 'reacting_idea', reaction_mode: 'up'
      disliking_disabled_reason = denied_reason_for_idea 'reacting_idea', reaction_mode: 'down'
      cancelling_reactions_disabled_reason = denied_reason_for_idea 'reacting_idea'
      voting_disabled_reason = denied_reason_for_idea 'voting'
      comment_reacting_disabled_reason = denied_reason_for_idea 'commenting_idea'

      {
        commenting_idea: {
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason,
          future_enabled_at: commenting_disabled_reason && future_enabled_phase('commenting_idea', user, idea.project)&.start_at
        },
        reacting_idea: {
          enabled: !liking_disabled_reason,
          disabled_reason: liking_disabled_reason,
          cancelling_enabled: !cancelling_reactions_disabled_reason,
          up: {
            enabled: !liking_disabled_reason,
            disabled_reason: liking_disabled_reason,
            future_enabled_at: liking_disabled_reason && future_enabled_phase('reacting_idea', user, idea.project, reaction_mode: 'up')&.start_at
          },
          down: {
            enabled: !disliking_disabled_reason,
            disabled_reason: disliking_disabled_reason,
            future_enabled_at: disliking_disabled_reason && future_enabled_phase('reacting_idea', user, idea.project, reaction_mode: 'down')&.start_at
          }
        },
        comment_reacting_idea: {
          enabled: !comment_reacting_disabled_reason,
          disabled_reason: comment_reacting_disabled_reason,
          future_enabled_at: comment_reacting_disabled_reason && future_enabled_phase('commenting_idea', user, idea.project)&.start_at
        },
        voting: {
          enabled: !voting_disabled_reason,
          disabled_reason: voting_disabled_reason,
          future_enabled_at: voting_disabled_reason && future_enabled_phase('voting', user, idea.project)&.start_at
        }
      }
    end

    private

    def idea_in_current_phase?(idea, current_phase)
      idea.ideas_phases.find { |ip| ip.phase_id == current_phase.id }
    end

    def posting_limit_reached?(phase, user)
      return true if phase.posting_limited? &&
                     phase.ideas.where(author: user, publication_status: 'published').size >= phase.posting_limited_max

      if phase.posting_limited? && phase.allow_anonymous_participation?
        author_hash = Idea.create_author_hash user.id, phase.project.id, true
        return phase.ideas.where(author_hash: author_hash).or(phase.ideas.where(author: user)).size >= phase.posting_limited_max
      end

      false
    end
  end
end
