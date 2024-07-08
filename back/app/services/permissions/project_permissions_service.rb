module Permissions
  class ProjectPermissionsService < BasePermissionsService
    PROJECT_DENIED_REASONS = {
      project_not_visible: 'project_not_visible'
    }.freeze

    def initialize(project, user, user_requirements_service: nil)
      super(user, user_requirements_service: user_requirements_service)
      @project ||= project
    end

    def denied_reason_for_project(action, reaction_mode: nil)
      project_visible_reason = project_visible_disabled_reason
      if project_visible_reason
        project_visible_reason
      else
        phase = @timeline_service.current_phase_not_archived project
        PhasePermissionsService.new(phase, user, user_requirements_service: user_requirements_service).denied_reason_for_phase action, project: project, reaction_mode: reaction_mode
      end
    end

    # Future enabled phases
    def future_enabled_phase(action, reaction_mode: nil)
      time = Time.zone.now
      @timeline_service.future_phases(project, time).find do |phase| 
        !PhasePermissionsService.new(phase, user, user_requirements_service: user_requirements_service).denied_reason_for_phase(action, reaction_mode: reaction_mode)
      end
    end

    def action_descriptors
      posting_disabled_reason = denied_reason_for_project 'posting_idea'
      commenting_disabled_reason = denied_reason_for_project 'commenting_idea'
      reacting_disabled_reason = denied_reason_for_project 'reacting_idea'
      liking_disabled_reason = denied_reason_for_project 'reacting_idea', reaction_mode: 'up'
      disliking_disabled_reason = denied_reason_for_project 'reacting_idea', reaction_mode: 'down'
      annotating_document_disabled_reason = denied_reason_for_project 'annotating_document'
      taking_survey_disabled_reason = denied_reason_for_project 'taking_survey'
      taking_poll_disabled_reason = denied_reason_for_project 'taking_poll'
      voting_disabled_reason = denied_reason_for_project 'voting'
      {
        posting_idea: {
          enabled: !posting_disabled_reason,
          disabled_reason: posting_disabled_reason,
          future_enabled_at: posting_disabled_reason && future_enabled_phase('posting_idea')&.start_at
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

    attr_reader :project

    # Project methods
    def project_visible_disabled_reason
      user_can_moderate = user && UserRoleService.new.can_moderate?(project, user)
      return if user_can_moderate

      if (project&.visible_to == 'admins' && !user_can_moderate) ||
         (project&.visible_to == 'groups' && project.groups && !user&.in_any_groups?(project.groups))
        PROJECT_DENIED_REASONS[:project_not_visible]
      end
    end
  end
end
