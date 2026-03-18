module ReportBuilder
  class Queries::DeviceTypes < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      exclude_roles: nil,
      **_other_props
    )
      visits_service = Insights::VisitsService.new(project_id, start_at:, end_at:, exclude_roles:)
      sessions = visits_service.filtered_sessions_query

      counts_per_device_type = sessions
        .where.not(device_type: nil)
        .group(:device_type)
        .count

      {
        counts_per_device_type: counts_per_device_type
      }
    end
  end
end
