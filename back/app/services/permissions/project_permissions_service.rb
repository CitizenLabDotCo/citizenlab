# frozen_string_literal: true

module Permissions
  class ProjectPermissionsService < Permissions::PermissionsService
    def action_descriptor(project, user)
      posting_disabled_reason = denied_reason_for_project project, user, 'posting_idea'
      commenting_disabled_reason = denied_reason_for_project project, user, 'commenting_idea'
      reacting_disabled_reason = denied_reason_for_project project, user, 'reacting_idea'
      liking_disabled_reason = denied_reason_for_project project, user, 'reacting_idea', mode: 'up'
      disliking_disabled_reason = denied_reason_for_project project, user, 'reacting_idea', mode: 'down'
      annotating_document_disabled_reason = denied_reason_for_project project, user, 'annotating_document'
      taking_survey_disabled_reason = denied_reason_for_project project, user, 'taking_survey'
      taking_poll_disabled_reason = denied_reason_for_project project, user, 'taking_poll'
      voting_disabled_reason = denied_reason_for_project project, user, 'voting'
      {
        posting_idea: {
          enabled: !posting_disabled_reason,
          disabled_reason: posting_disabled_reason,
          future_enabled: posting_disabled_reason && future_enabled_phase(project, user, 'posting_idea')&.start_at
        },
        commenting_idea: {
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason
        },
        reacting_idea: {
          enabled: !reacting_disabled_reason,
          disabled_reason: reacting_disabled_reason,
          up: {
            enabled: !liking_disabled_reason,
            disabled_reason: liking_disabled_reason
          },
          down: {
            enabled: !disliking_disabled_reason,
            disabled_reason: disliking_disabled_reason
          }
        },
        comment_reacting_idea: {
          # You can react if you can comment.
          enabled: !commenting_disabled_reason,
          disabled_reason: commenting_disabled_reason
        },
        annotating_document: {
          enabled: !annotating_document_disabled_reason,
          disabled_reason: annotating_document_disabled_reason
        },
        taking_survey: {
          enabled: !taking_survey_disabled_reason,
          disabled_reason: taking_survey_disabled_reason
        },
        taking_poll: {
          enabled: !taking_poll_disabled_reason,
          disabled_reason: taking_poll_disabled_reason
        },
        voting: {
          enabled: !voting_disabled_reason,
          disabled_reason: voting_disabled_reason
        }
      }
    end
  end
end
