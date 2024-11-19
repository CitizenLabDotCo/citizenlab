# frozen_string_literal: true

module ReportBuilder
  class PublishedGraphDataUnitPolicy < ::ApplicationPolicy
    def published?
      policy_for(record.report).layout?
    end
  end
end
