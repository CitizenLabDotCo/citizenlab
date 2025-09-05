module ReportBuilder
  class LiveGraphDataUnitPolicy < ::ApplicationPolicy
    def live?
      props = record

      if props[:phase_id].present?
        phase = Phase.find(props[:phase_id])
        policy_for(phase).active_moderator?
      elsif props[:project_id].present?
        project = Project.find(props[:project_id])
        policy_for(project).active_moderator?
      else
        # For global project widgets (like ProjectsTimelineWidget, ProjectsWidget),
        # allow access if user is admin or project moderator
        active_admin? || user&.project_moderator? || user&.project_folder_moderator?
      end
    end
  end
end
