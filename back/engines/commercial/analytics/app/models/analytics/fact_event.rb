# frozen_string_literal: true

module Analytics
  class FactEvent < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :dimension_project_id, :string
    attribute :dimension_date_created_id, :date
    attribute :dimension_date_start_id, :date
    attribute :dimension_date_end_id, :date

    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject'
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_start, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_end, class_name: 'Analytics::DimensionDate', primary_key: 'date'

    backed_by_query <<~SQL.squish
      SELECT
        id,
        project_id AS dimension_project_id,
        created_at::DATE AS dimension_date_created_id,
        start_at::DATE AS dimension_date_start_id,
        end_at::DATE AS dimension_date_end_id
      FROM events
    SQL
  end
end
