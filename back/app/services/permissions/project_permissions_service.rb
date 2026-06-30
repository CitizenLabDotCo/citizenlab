module Permissions
  class ProjectPermissionsService < PhasePermissionsService
    ATTENDING_EVENT_DENIED_REASONS = {
      attending_event_not_supported: 'attending_event_not_supported'
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
      project_reason = project_denied_reason(project)
      return project_reason if project_reason
      return attending_event_denied_reason_for_action if action == 'attending_event'
      return PROJECT_DENIED_REASONS[:project_inactive] if !phase

      super
    end

    # Future enabled phases
    def future_enabled_phase(action, reaction_mode: nil)
      time = Time.zone.now
      @timeline_service.future_phases(project, time).find do |phase|
        !PhasePermissionsService.new(phase, user, user_requirements_service: user_requirements_service).denied_reason_for_action(action, reaction_mode: reaction_mode)
      end
    end

    # The project's descriptors are its current phase's, plus the project-level
    # attending_event action and a future_enabled_at lookahead for posting.
    def action_descriptors
      descriptors = super
      descriptors[:attending_event] = descriptor(denied_reason_for_action('attending_event'))
      posting_disabled_reason = descriptors[:posting_idea][:disabled_reason]
      descriptors[:posting_idea][:future_enabled_at] =
        posting_disabled_reason && future_enabled_phase('posting_idea')&.start_at
      descriptors
    end

    private

    attr_reader :project

    # Events aren't tied to a phase, so attending_event isn't blocked when there's no current
    # phase - yet its permission is still resolved per phase (scope: phase), a known inconsistency.
    def attending_event_denied_reason_for_action
      return ATTENDING_EVENT_DENIED_REASONS[:attending_event_not_supported] if phase && !participation_method.supports_event_attendance?

      user_denied_reason(find_permission('attending_event', scope: phase))
    end
  end
end
