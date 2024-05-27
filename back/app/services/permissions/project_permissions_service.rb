# frozen_string_literal: true

module Permissions
  class ProjectPermissionsService < PhasePermissionsService
    PROJECT_DENIED_REASONS = {
      project_not_visible: 'project_not_visible'
    }.freeze

    def denied_reason_for_action(action, user, project, reaction_mode: nil)
      project_visible_reason = project_visible_disabled_reason(project, user)
      if project_visible_reason
        project_visible_reason
      else
        phase = @timeline_service.current_phase_not_archived project
        super action, user, phase, project: project, reaction_mode: reaction_mode
      end
    end

    # Future enabled phases
    def future_enabled_phase(action, user, project, reaction_mode: nil)
      time = Time.zone.now
      @timeline_service.future_phases(project, time).find { |phase| !denied_reason_for_phase(action, user, phase, reaction_mode: reaction_mode) }
    end

    def action_descriptors(project, user)
      posting_disabled_reason = denied_reason_for_action 'posting_idea', user, project
      commenting_disabled_reason = denied_reason_for_action 'commenting_idea', user, project
      reacting_disabled_reason = denied_reason_for_action 'reacting_idea', user, project
      liking_disabled_reason = denied_reason_for_action 'reacting_idea', user, project, reaction_mode: 'up'
      disliking_disabled_reason = denied_reason_for_action 'reacting_idea', user, project, reaction_mode: 'down'
      annotating_document_disabled_reason = denied_reason_for_action 'annotating_document', user, project
      taking_survey_disabled_reason = denied_reason_for_action 'taking_survey', user, project
      taking_poll_disabled_reason = denied_reason_for_action 'taking_poll', user, project
      voting_disabled_reason = denied_reason_for_action 'voting', user, project
      {
        posting_idea: {
          enabled: !posting_disabled_reason,
          disabled_reason: posting_disabled_reason,
          future_enabled: posting_disabled_reason && future_enabled_phase('posting_idea', user, project)&.start_at
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

    private

    # Project methods
    def project_visible_disabled_reason(project, user)
      if (project&.visible_to == 'admins' && !user.admin?) ||
         (project&.visible_to == 'groups' && !user.in_any_groups?(project.groups))
        PROJECT_DENIED_REASONS[:project_not_visible]
      end
    end
  end
end
