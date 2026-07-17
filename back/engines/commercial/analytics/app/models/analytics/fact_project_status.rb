# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_project_statuses
#
#  dimension_project_id :uuid
#  status               :string
#  finished             :boolean
#  timestamp            :datetime
#  dimension_date_id    :date
#
module Analytics
  class FactProjectStatus < Analytics::ApplicationRecordView
    # The view holds one row per project, so this is a natural key. Required for `count`
    # on an eager-loaded relation: without it, `Array(arel_table[Arel.star])` splits the
    # Arel attribute Struct into [table, *] and interpolates the table object into the
    # SQL (activerecord 7.2 calculations.rb#calculate).
    self.primary_key = :dimension_project_id

    belongs_to :dimension_date
    belongs_to :dimension_project
  end
end
