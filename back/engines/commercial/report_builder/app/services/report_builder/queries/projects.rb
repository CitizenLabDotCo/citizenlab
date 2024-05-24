module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, **_other_props)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      project_that_have_phases_ids = Phase.all.select(:project_id)
      non_overlapping_project_ids = Phase.where('end_at <= ? OR start_at >= ?', start_date, end_date).select(:project_id)

      overlapping_projects = Project
        .where(id: project_that_have_phases_ids)
        .where.not(id: non_overlapping_project_ids)

      {
        projects: ::WebApi::V1::ProjectSerializer.new(
          overlapping_projects,
          params: { current_user: @current_user }
        ).serializable_hash[:data]
      }
    end
  end
end
