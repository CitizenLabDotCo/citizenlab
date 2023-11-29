module ReportBuilder
  class LiveGraphDataUnitPolicy < ::ApplicationPolicy
    def live?
      props = record
      if props[:project_id].present?
        ProjectPolicy.new(user, Project.find(props[:project_id])).active_moderator?
      else
        admin? && active?
      end
    end
  end
end
