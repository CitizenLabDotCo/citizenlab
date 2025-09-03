module ReportBuilder
  class Queries::Registrations < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      resolution: 'month',
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse
      registrations_in_period = User.where(registration_completed_at: start_date..end_date)

      # Time series
      registrations_timeseries = registrations_in_period
        .select("
          count(*) as registrations,
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

      registrations_whole_period = registrations_in_period.count

      response = {
        registrations_timeseries: registrations_timeseries,
        registrations_whole_period: registrations_whole_period,
        registration_rate_whole_period: registration_rate(
          registrations_whole_period,
          start_date,
          end_date
        )
      }

      if compare_start_at && compare_end_at
        registrations_compared_period = User
          .where(registration_completed_at: compare_start_at..compare_end_at)
          .count

        response[:registrations_compared_period] = registrations_compared_period
        response[:registration_rate_compared_period] = registration_rate(
          registrations_compared_period,
          compare_start_at,
          compare_end_at
        )
      end

      response
    end

    def registration_rate(registrations, start_date, end_date)
      visitors = ImpactTracking::Session
        .where(created_at: start_date..end_date)
        .distinct
        .pluck(:monthly_user_hash)
        .count

      visitors.zero? ? 0 : (registrations / visitors.to_f)
    end
  end
end
