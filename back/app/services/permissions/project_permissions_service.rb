module Permissions
  class ProjectPermissionsService < BasePermissionsService
    ATTENDING_EVENT_DENIED_REASONS = {
      attending_event_not_supported: 'attending_event_not_supported'
    }.freeze

    def initialize(project, user, user_requirements_service: nil, fallback_to_last_phase: false)
      super(user, user_requirements_service: user_requirements_service)
      @project = project
      timeline_service = TimelineService.new
      @phase = if fallback_to_last_phase
        timeline_service.current_phase_or_last_completed_not_archived project
      else
        timeline_service.current_phase_not_archived project
      end
      @phase.project = project if @phase # Performance optimization (keep preloaded relationships)
    end

    def denied_reason_for_action(action)
      raise "Unsupported action: #{action}" if action != 'attending_event'

      project_reason = project_denied_reason(project)
      return project_reason if project_reason

      attending_event_denied_reason_for_action
    end

    def action_descriptors
      { attending_event: descriptor(denied_reason_for_action('attending_event')) }
    end

    private

    attr_reader :project, :phase

    # Events aren't tied to a phase, so attending_event isn't blocked when there's no current
    # phase - yet its permission is still resolved per phase (scope: phase), a known inconsistency.
    def attending_event_denied_reason_for_action
      return ATTENDING_EVENT_DENIED_REASONS[:attending_event_not_supported] if phase && !phase.pmethod.supports_event_attendance?

      user_denied_reason(find_permission('attending_event', scope: phase))
    end
  end
end
