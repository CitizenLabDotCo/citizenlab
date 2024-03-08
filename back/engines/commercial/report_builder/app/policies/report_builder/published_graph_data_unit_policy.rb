# frozen_string_literal: true

module ReportBuilder
  class PublishedGraphDataUnitPolicy < ::ApplicationPolicy
    def published?
      ReportPolicy.new(user, record.report).layout?
    end
  end
end
