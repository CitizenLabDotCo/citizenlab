module ReportBuilder
  class LiveGraphDataUnitPolicy < ::ApplicationPolicy
    def live?
      props = record

      if props[:phase_id].present?
        phase = Phase.find(props[:phase_id])
        PhasePolicy.new(user, phase).active_moderator?
      elsif props[:project_id].present?
        project = Project.find(props[:project_id])
        ProjectPolicy.new(user, project).active_moderator?
      else
        active_admin?
      end
    end
  end
end
