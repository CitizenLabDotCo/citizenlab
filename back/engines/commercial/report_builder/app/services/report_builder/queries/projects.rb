module ReportBuilder
  class Queries::Projects < ReportBuilder::Queries::Base
    def run_query(start_at: nil, end_at: nil, **_other_props)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      project_ids = Phase.where.not('end_at <= ? OR start_at >= ?', start_date, end_date).select(:project_id)
      projects = Project.where(id: project_ids)

      {
        projects: ::WebApi::V1::ProjectSerializer.new(
          projects,
          params: { current_user: @current_user }
        ).serializable_hash[:data]
      }
    end
  end
end
