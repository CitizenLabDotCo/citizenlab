# frozen_string_literal: true

module Analytics
  class FactProjectStatus < Analytics::ApplicationRecordView
    attribute :dimension_project_id, :string
    attribute :status, :string
    attribute :finished, :boolean
    attribute :timestamp, :datetime
    attribute :dimension_date_id, :date

    belongs_to :dimension_date
    belongs_to :dimension_project

    backed_by_query <<~SQL.squish
      WITH finished_statuses_for_timeline_projects AS
        (SELECT phases.project_id, MAX(phases.end_at) as timestamp
         FROM phases
         GROUP BY phases.project_id
         HAVING MAX(phases.end_at) < NOW())
      SELECT
        ap.publication_id as dimension_project_id,
        ap.publication_status as status,
        ap.publication_status = 'archived' OR
        (fsftp.project_id IS NOT NULL AND ap.publication_status != 'draft') as finished,
        COALESCE(fsftp.timestamp, ap.updated_at) as timestamp,
        COALESCE(fsftp.timestamp::DATE, ap.updated_at::DATE) as dimension_date_id
      FROM admin_publications ap
      LEFT JOIN projects p ON ap.publication_id = p.id
      LEFT JOIN finished_statuses_for_timeline_projects fsftp ON fsftp.project_id = ap.publication_id
      WHERE ap.publication_type = 'Project'
    SQL
  end
end
