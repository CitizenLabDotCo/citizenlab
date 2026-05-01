# frozen_string_literal: true

module Analytics
  class DimensionUser < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :role, :string
    attribute :invite_status, :string
    attribute :has_visits, :boolean

    backed_by_query <<~SQL.squish
      SELECT
        u.id,
        COALESCE(u.roles->0->>'type','citizen') AS role,
        u.invite_status,
        users_with_visits.dimension_user_id IS NOT NULL as has_visits
      FROM users u
      LEFT JOIN (
        SELECT DISTINCT dimension_user_id
        FROM analytics_fact_visits
      ) users_with_visits ON users_with_visits.dimension_user_id = u.id
    SQL
  end
end
