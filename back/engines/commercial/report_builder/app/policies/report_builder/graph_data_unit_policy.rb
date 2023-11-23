# frozen_string_literal: true

module ReportBuilder
  class GraphDataUnitPolicy < ::ApplicationPolicy
    def live?
      if props[:project_id].present?
        UserRoleService.new.can_moderate?(Project.find(props[:project_id]), user)
      else
        admin? && active?
      end
    end

    def published?
      record.report.phase.started? && PhasePolicy.new(user, record.report.phase).show?
    end
  end
end
