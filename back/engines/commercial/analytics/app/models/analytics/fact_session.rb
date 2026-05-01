# frozen_string_literal: true

module Analytics
  class FactSession < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :monthly_user_hash, :string
    attribute :dimension_date_created_id, :date
    attribute :dimension_date_updated_id, :date
    attribute :dimension_user_id, :string

    belongs_to :dimension_user, class_name: 'Analytics::DimensionUser', optional: true
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_updated, class_name: 'Analytics::DimensionDate', primary_key: 'date'

    backed_by_query <<~SQL.squish
      SELECT
        id,
        monthly_user_hash,
        created_at::DATE AS dimension_date_created_id,
        updated_at::DATE AS dimension_date_updated_id,
        user_id AS dimension_user_id
      FROM impact_tracking_sessions
    SQL
  end
end
