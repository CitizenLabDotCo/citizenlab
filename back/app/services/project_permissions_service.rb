# frozen_string_literal: true

class ProjectPermissionsService < ParticipationPermissionsService
  def action_descriptor(project, user)
    posting_disabled_reason = posting_idea_disabled_reason_for_project project, user
    commenting_disabled_reason = commenting_idea_disabled_reason_for_project project, user
    reacting_disabled_reason = idea_reacting_disabled_reason_for project, user
    liking_disabled_reason = idea_reacting_disabled_reason_for project, user, mode: 'up'
    disliking_disabled_reason = idea_reacting_disabled_reason_for project, user, mode: 'down'
    annotating_document_disabled_reason = annotating_document_disabled_reason_for_project project, user
    taking_survey_disabled_reason = taking_survey_disabled_reason_for_project project, user
    taking_poll_disabled_reason = taking_poll_disabled_reason_for_project project, user
    voting_disabled_reason = voting_disabled_reason_for_project project, user
    {
      posting_idea: {
        enabled: !posting_disabled_reason,
        disabled_reason: posting_disabled_reason,
        future_enabled: posting_disabled_reason && future_posting_idea_enabled_phase(project, user)&.start_at
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
