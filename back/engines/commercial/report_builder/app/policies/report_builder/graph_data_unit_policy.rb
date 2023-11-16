# frozen_string_literal: true

module ReportBuilder
  class GraphDataUnitPolicy < ::ApplicationPolicy
    def live?
      admin? && active?
    end

    def published?
      PhasePolicy::Scope.new(user, Phase).resolve.exists?(id: record.report.phase_id)
    end
  end
end
