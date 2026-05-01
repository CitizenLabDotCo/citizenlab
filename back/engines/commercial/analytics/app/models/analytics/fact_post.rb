# frozen_string_literal: true

module Analytics
  class FactPost < Analytics::ApplicationRecordView
    self.primary_key = :id

    attribute :id, :string
    attribute :user_id, :string
    attribute :dimension_project_id, :string
    attribute :dimension_type_id, :string
    attribute :dimension_date_created_id, :date
    attribute :dimension_date_first_feedback_id, :date
    attribute :dimension_status_id, :string
    attribute :feedback_time_taken, :string
    attribute :feedback_official, :integer
    attribute :feedback_status_change, :integer
    attribute :feedback_none, :integer
    attribute :reactions_count, :integer
    attribute :likes_count, :integer
    attribute :dislikes_count, :integer
    attribute :publication_status, :string

    belongs_to :dimension_type, class_name: 'Analytics::DimensionType'
    belongs_to :dimension_date_created, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_date_first_feedback, class_name: 'Analytics::DimensionDate', primary_key: 'date'
    belongs_to :dimension_project, class_name: 'Analytics::DimensionProject'
    belongs_to :dimension_status, class_name: 'Analytics::DimensionStatus'

    # Inlines the analytics_build_feedbacks view as a CTE
    backed_by_query <<~SQL.squish
      WITH analytics_build_feedbacks AS (
        SELECT
          post_id,
          MIN(feedback_first_date) AS feedback_first_date,
          MAX(feedback_official) AS feedback_official,
          MAX(feedback_status_change) AS feedback_status_change
        FROM (
          SELECT
            item_id AS post_id,
            MIN(created_at) AS feedback_first_date,
            0 AS feedback_official,
            1 AS feedback_status_change
          FROM activities
          WHERE action = 'changed_status' AND item_type = 'Idea'
          GROUP BY item_id

          UNION ALL

          SELECT
            idea_id AS post_id,
            MIN(created_at) AS feedback_first_date,
            1 AS feedback_official,
            0 AS feedback_status_change
          FROM official_feedbacks
          GROUP BY post_id
        ) AS a
        GROUP BY post_id
      )
      SELECT
        i.id,
        i.author_id AS user_id,
        i.project_id AS dimension_project_id,
        adt.id as dimension_type_id,
        i.created_at::DATE AS dimension_date_created_id,
        abf.feedback_first_date::DATE as dimension_date_first_feedback_id,
        idea_status_id as dimension_status_id,
        (abf.feedback_first_date - i.created_at) as feedback_time_taken,
        COALESCE(abf.feedback_official,0) AS feedback_official,
        COALESCE(abf.feedback_status_change,0) AS feedback_status_change,
        CASE WHEN abf.feedback_first_date IS NULL THEN 1 ELSE 0 END AS feedback_none,
        likes_count + dislikes_count as reactions_count,
        likes_count,
        dislikes_count,
        i.publication_status
      FROM ideas i
      LEFT JOIN analytics_build_feedbacks AS abf ON abf.post_id = i.id
      LEFT JOIN phases AS creation_phase on i.creation_phase_id = creation_phase.id
      INNER JOIN analytics_dimension_types adt ON adt.name = CASE
                                                                WHEN creation_phase IS NULL THEN 'idea'
                                                                WHEN creation_phase.participation_method = 'proposals' THEN 'proposal'
                                                              END
      WHERE creation_phase IS NULL OR creation_phase.participation_method = 'proposals'
    SQL
  end
end
