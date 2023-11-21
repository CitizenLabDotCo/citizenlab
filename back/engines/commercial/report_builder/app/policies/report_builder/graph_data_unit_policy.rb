# frozen_string_literal: true

module ReportBuilder
  class GraphDataUnitPolicy < ::ApplicationPolicy
    def live?
      admin? && active?
    end

    def published?
      record.report.phase.start_at <= Time.zone.now &&
        PhasePolicy::Scope.new(user, Phase).resolve.exists?(id: record.report.phase_id)
    end
  end
end
