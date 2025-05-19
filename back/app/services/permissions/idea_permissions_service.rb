module Permissions
  class IdeaPermissionsService < ProjectPermissionsService
    IDEA_DENIED_REASONS = {
      idea_not_in_current_phase: 'idea_not_in_current_phase',
      votes_exist: 'votes_exist',
      published_after_screening: 'published_after_screening',
      not_author: 'not_author',
      not_reactable_status_code: 'not_reactable_status_code'
    }.freeze

    def initialize(idea, user, user_requirements_service: nil)
      super(idea.project, user, user_requirements_service: user_requirements_service)
      @idea ||= idea
    end

    def denied_reason_for_action(action, reaction_mode: nil, delete_action: false)
      case action
      when 'editing_idea'
        # We have different order of rules for editing_idea, in order to:
        # 1) Support editing of ideas by admins/moderators, even if the project
        #    is no longer active
        # 2) Performance optimization for the active descriptor, first checking
        #    whether user is the author before doing more heavier checks
        #    involving permissions and votes
        return if user && UserRoleService.new.can_moderate_project?(idea.project, user)
        return IDEA_DENIED_REASONS[:not_author] if (idea.author_id != user&.id) || idea.author_id.nil? || !user&.active?

        reason = super
        return reason if reason

        return IDEA_DENIED_REASONS[:votes_exist] if idea.participation_method_on_creation.use_reactions_as_votes? && idea.reactions.where.not(user_id: user&.id).exists?

        IDEA_DENIED_REASONS[:published_after_screening] if idea.creation_phase&.prescreening_enabled && idea.published?
      else
        # Check for idea status reason first, to avoid situations where FE presents user
        # with what looks like a possible action, (i.e. reacting), redirects user to signin flow,
        # and then once signed in, the user finds the action is not possible.
        if action == 'reacting_idea' && IdeaStatus::REACTING_NOT_ALLOWED_CODES.include?(idea&.idea_status&.code)
          return IDEA_DENIED_REASONS[:not_reactable_status_code]
        end

        reason = super
        return reason if reason
        return if user && UserRoleService.new.can_moderate_project?(idea.project, user)

        # The input does not need to be in the current phase for editing.
        # We preserved the behaviour that was already there, but we're not
        # sure if this is the desired behaviour.
        current_phase = @timeline_service.current_phase_not_archived project
        IDEA_DENIED_REASONS[:idea_not_in_current_phase] if current_phase && !idea_in_current_phase?(current_phase)
      end
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

    private

    attr_reader :idea

    def idea_in_current_phase?(current_phase)
      idea.ideas_phases.find { |ip| ip.phase_id == current_phase.id }
    end
  end
end
