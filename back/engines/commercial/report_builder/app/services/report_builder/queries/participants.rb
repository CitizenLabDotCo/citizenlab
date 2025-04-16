module ReportBuilder
  class Queries::Participants < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: 'month',
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      # Time series
      participants_timeseries = participations(
        start_date, end_date, project_id: project_id
      )
        .select("
          count(distinct participant_id) as participants,
          date_trunc('#{resolution}', dimension_date_created) as date_group
        ")
        .group('date_group')
        .order('date_group')
        .map do |row|
          {
            participants: row.participants,
            date_group: row.date_group.to_date
          }
        end
      
      {
        participants_timeseries: participants_timeseries,
      }
    end

    def participations(start_date, end_date, project_id: nil)
      participations = Analytics::FactParticipation
        .where(dimension_date_created_id: start_date..end_date)

      if project_id
        participations = participations
          .where(dimension_project_id: project_id)
      end

      participations
    end
  end
end
