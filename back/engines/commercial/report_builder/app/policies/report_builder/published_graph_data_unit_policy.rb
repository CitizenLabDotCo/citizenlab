# frozen_string_literal: true

module ReportBuilder
  class PublishedGraphDataUnitPolicy < ::ApplicationPolicy
    def published?
      # TODO: hide report on UI in this case
      record.report.phase.started? && PhasePolicy.new(user, record.report.phase).show?
    end
  end
end
