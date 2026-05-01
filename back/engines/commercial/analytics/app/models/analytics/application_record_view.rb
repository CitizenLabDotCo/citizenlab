# frozen_string_literal: true

module Analytics
  class ApplicationRecordView < ApplicationRecord
    self.abstract_class = true

    def readonly?
      true
    end

    # Replaces scenic SQL views with inline subqueries.
    # The SQL is wrapped in a FROM clause aliased to the model's table_name,
    # so ActiveRecord queries (.where, .group, .pluck, etc.) work unchanged.
    def self.backed_by_query(sql)
      default_scope { from(Arel.sql("(#{sql}) AS #{table_name}")) }
    end
  end
end
