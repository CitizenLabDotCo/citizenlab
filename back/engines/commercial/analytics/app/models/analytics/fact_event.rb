# frozen_string_literal: true

# == Schema Information
#
# Table name: analytics_fact_events
#
#  id                        :uuid             primary key
#  dimension_project_id      :uuid
#  dimension_date_created_id :date
#  dimension_date_start_id   :date
#  dimension_date_end_id     :date
#
module Analytics
  class FactEvent < Analytics::ApplicationRecordView
    self.primary_key = :id
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject'
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_start, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_end, class_name: 'Analytics::DimensionDate', primary_key: 'date'
  end
end
