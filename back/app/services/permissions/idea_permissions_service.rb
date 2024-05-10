# frozen_string_literal: true

module Permissions
  class IdeaPermissionsService < Permissions::ProjectPermissionsService
    def action_descriptor(idea, user)
      commenting_disabled_reason = denied_reason_for_idea(idea, user, 'commenting_idea')
      liking_disabled_reason = denied_reason_for_idea(idea, user, mode: 'up')
      disliking_disabled_reason = denied_reason_for_idea(idea, user, mode: 'down')
      cancelling_reactions_disabled_reason = cancelling_reacting_disabled_reason_for_idea(idea, user)
      voting_disabled_reason = denied_reason_for_idea(idea, user, 'voting')
      comment_reacting_disabled_reason = reacting_disabled_reason_for_idea_comment(Comment.new(post: idea), user)

      {
        commenting_idea: {
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason,
          future_enabled: commenting_disabled_reason && future_enabled_phase(idea.project, user, 'commenting_idea')&.start_at
        },
        reacting_idea: {
          enabled: !liking_disabled_reason,
          disabled_reason: liking_disabled_reason,
          cancelling_enabled: !cancelling_reactions_disabled_reason,
          up: {
            enabled: !liking_disabled_reason,
            disabled_reason: liking_disabled_reason,
            future_enabled: liking_disabled_reason && future_enabled_phase(idea.project, user, 'reacting_idea', mode: up)&.start_at
          },
          down: {
            enabled: !disliking_disabled_reason,
            disabled_reason: disliking_disabled_reason,
            future_enabled: disliking_disabled_reason && future_enabled_phase(idea.project, user, 'reacting_idea', mode: down)&.start_at
          }
        },
        comment_reacting_idea: {
          enabled: !comment_reacting_disabled_reason,
          disabled_reason: comment_reacting_disabled_reason,
          future_enabled: comment_reacting_disabled_reason && future_enabled_phase(idea.project, user, 'commenting_idea')&.start_at
        },
        voting: {
          enabled: !voting_disabled_reason,
          disabled_reason: voting_disabled_reason,
          future_enabled: voting_disabled_reason && future_enabled_phase(idea.project, user, 'voting')&.start_at
        }
      }
    end
  end
end
