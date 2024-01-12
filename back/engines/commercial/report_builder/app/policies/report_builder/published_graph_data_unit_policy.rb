# frozen_string_literal: true

module ReportBuilder
  class PublishedGraphDataUnitPolicy < ::ApplicationPolicy
    def published?
      record.report.phase.started? && PhasePolicy.new(user, record.report.phase).show?
    end
  end
end
