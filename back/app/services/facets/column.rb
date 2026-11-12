# frozen_string_literal: true

module Facets
  # A facet on a column of the records: one option per distinct value.
  class Column
    def initialize(column)
      @column = column
    end

    def key = @column.to_s

    def counts(records)
      records.where.not(@column => nil).group(@column).count
    end
  end
end
