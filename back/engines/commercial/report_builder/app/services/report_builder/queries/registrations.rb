module ReportBuilder
  class Queries::Registrations < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      resolution: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      untransformed_response = run_query_untransformed(
        start_date,
        end_date,
        resolution: resolution,
        project_id: project_id,
        compare_start_at: compare_start_at,
        compare_end_at: compare_end_at
      )

      transform_response(untransformed_response)
    end

    def transform_response(untransformed_response)
      # TODO
      untransformed_response
    end

    def run_query_untransformed(
      start_at,
      end_at,
      resolution: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      registrations_in_period = User.where(registration_completed_at: start_at..end_at)

      # Time series
      registrations_timeseries = registrations_in_period
        .select("
          count(*) as registrations
          date_trunc('#{resolution}', registration_completed_at) as date_group
        ")
        .group('date_group')
        .order('date_group')
        .map do |row|
          {
            registrations: row.registrations,
            date_group: row.date_group.to_date
          }
        end

      # Registrations whole period
      registrations_whole_period = registrations_in_period.count

      # Visitors whole period
      # TODO

      {
        registrations_timeseries: registrations_timeseries,
        registrations_whole_period: registrations_whole_period
      }
    end
  end
end