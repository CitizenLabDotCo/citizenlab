module ReportBuilder
  class Queries::Participants < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: 'month',
      exclude_roles: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_at, end_at = TimeBoundaries.parse(start_at, end_at)

      # Time series
      participants_timeseries = participations_timeseries(
        start_at, end_at, resolution,
        project_id: project_id, exclude_roles: exclude_roles
      )

      participants_whole_period = count_participants(
        start_at, end_at,
        project_id: project_id, exclude_roles: exclude_roles
      )

      response = {
        participants_timeseries: participants_timeseries,
        participants_whole_period: participants_whole_period,
        participation_rate_whole_period: participation_rate_as_percent(
          participants_whole_period, start_at, end_at,
          project_id: project_id, exclude_roles: exclude_roles
        )
      }

      if compare_start_at && compare_end_at
        compare_start_at, compare_end_at = TimeBoundaries.parse(compare_start_at, compare_end_at)
        participants_compared_period = count_participants(
          compare_start_at, compare_end_at,
          project_id: project_id, exclude_roles: exclude_roles
        )

        response[:participants_compared_period] = participants_compared_period
        response[:participation_rate_compared_period] = participation_rate_as_percent(
          participants_compared_period, compare_start_at, compare_end_at,
          project_id: project_id, exclude_roles: exclude_roles
        )
      end

      response
    end

    private

    def participations_timeseries(start_at, end_at, resolution, project_id: nil, exclude_roles: nil)
      union_sql = build_union_sql(start_at, end_at, project_id: project_id, exclude_roles: exclude_roles)

      sql = <<~SQL.squish
        SELECT
          COUNT(DISTINCT participant_id) AS participants,
          date_trunc('#{resolution}', created_at) AS date_group
        FROM (#{union_sql}) AS all_participations
        GROUP BY date_group
        ORDER BY date_group
      SQL

      ActiveRecord::Base.connection.select_all(
        ActiveRecord::Base.sanitize_sql(sql)
      ).map do |row|
        {
          participants: row['participants'].to_i,
          date_group: row['date_group'].to_date
        }
      end
    end

    def count_participants(start_at, end_at, project_id: nil, exclude_roles: nil)
      union_sql = build_union_sql(start_at, end_at, project_id: project_id, exclude_roles: exclude_roles)
      sql = "SELECT COUNT(DISTINCT participant_id) FROM (#{union_sql}) AS all_participations"

      ActiveRecord::Base.connection.select_value(
        ActiveRecord::Base.sanitize_sql(sql)
      ).to_i
    end

    def build_union_sql(start_at, end_at, project_id: nil, exclude_roles: nil)
      project_filter = if project_id.present?
        sanitize_sql('= ?', project_id)
      else
        'IS NOT NULL'
      end

      date_filter = sanitize_sql('created_at >= ? AND created_at < ?', start_at, end_at)

      ParticipantsService.participations_union_sql(
        project_filter,
        date_filter: date_filter,
        exclude_roles: exclude_roles,
        include_created_at: true
      )
    end

    def participation_rate_as_percent(participants, start_at, end_at, project_id: nil, exclude_roles: nil)
      visits_service = Insights::VisitsService.new(project_id, start_at:, end_at:, exclude_roles:)
      visitors = visits_service.total_visits[:visitors]
      visitors.zero? ? 0 : (participants / visitors.to_f)
    end
  end
end
