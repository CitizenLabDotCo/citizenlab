module ReportBuilder
  class Queries::Registrations < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      resolution: 'month',
      exclude_roles: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      start_at, end_at = TimeBoundaries.parse(start_at, end_at)
      registrations_in_period = registrations(start_at, end_at, exclude_roles)

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
          start_at,
          end_at,
          exclude_roles
        )
      }

      if compare_start_at && compare_end_at
        compare_start_at, compare_end_at = TimeBoundaries.parse(compare_start_at, compare_end_at)
        registrations_compared_period = registrations(compare_start_at, compare_end_at, exclude_roles).count

        response[:registrations_compared_period] = registrations_compared_period
        response[:registration_rate_compared_period] = registration_rate(
          registrations_compared_period,
          compare_start_at,
          compare_end_at,
          exclude_roles
        )
      end

      response
    end

    def registrations(start_at, end_at, exclude_roles)
      users = User.where(registration_completed_at: start_at...end_at)
      exclude_admins_and_moderators?(exclude_roles) ? users.normal_user : users
    end

    def registration_rate(registrations, start_at, end_at, exclude_roles)
      visits_service = Insights::VisitsService.new(nil, start_at:, end_at:, exclude_roles:)
      visitors = visits_service.total_visits[:visitors]
      visitors.zero? ? 0 : (registrations / visitors.to_f)
    end
  end
end
