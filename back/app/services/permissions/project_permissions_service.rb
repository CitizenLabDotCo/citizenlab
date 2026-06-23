module Permissions
  class ProjectPermissionsService < PhasePermissionsService
    PROJECT_DENIED_REASONS = {
      project_not_visible: 'project_not_visible'
    }.freeze

    def initialize(project, user, user_requirements_service: nil, request: nil, fallback_to_last_phase: false)
      @timeline_service = TimelineService.new
      phase = if fallback_to_last_phase
        @timeline_service.current_phase_or_last_completed_not_archived project
      else
        @timeline_service.current_phase_not_archived project
      end
      phase.project = project if phase # Performance optimization (keep preloaded relationships)
      super(phase, user, user_requirements_service: user_requirements_service, request: request)
      @project ||= project
    end

    def denied_reason_for_action(action, reaction_mode: nil, delete_action: false)
      project_visible_disabled_reason || project_archived_disabled_reason || super
    end

    # Future enabled phases
    def future_enabled_phase(action, reaction_mode: nil)
      time = Time.zone.now
      @timeline_service.future_phases(project, time).find do |phase|
        !PhasePermissionsService.new(phase, user, user_requirements_service: user_requirements_service).denied_reason_for_action(action, reaction_mode: reaction_mode)
      end
    end

    # The project's descriptors are its current phase's, plus a project-level
    # future_enabled_at lookahead (when posting opens in a later phase).
    def action_descriptors
      descriptors = super
      posting_disabled_reason = descriptors[:posting_idea][:disabled_reason]
      descriptors[:posting_idea][:future_enabled_at] =
        posting_disabled_reason && future_enabled_phase('posting_idea')&.start_at
      descriptors
    end

    def project_visible_disabled_reason
      user_can_moderate = user && UserRoleService.new.can_moderate?(project, user)
      return if user_can_moderate

      if (project&.visible_to == 'admins' && !user_can_moderate) ||
         (project&.visible_to == 'groups' && project.groups && !user&.in_any_groups?(project.groups))
        PROJECT_DENIED_REASONS[:project_not_visible]
      end
    end

    private

    attr_reader :project

    def project_archived_disabled_reason
      return unless project.admin_publication.archived?

      PHASE_DENIED_REASONS[:project_inactive]
    end
  end
end
