module ReportBuilder
  class Queries::Analytics::Registrations < Queries::Analytics::Base
    def registrations_query(start_at, end_at, apply_visitor_filter: false)
      {
        fact: 'registration',
        filters: {
          **date_filter('dimension_date_registration', start_at, end_at),
          **visitor_filter(apply_visitor_filter)
        },
        aggregations: {
          all: 'count'
        }
      }
    end

    def visitors_query(start_at, end_at)
      {
        fact: 'visit',
        filters: {
          **date_filter('dimension_date_first_action', start_at, end_at)
        },
        aggregations: {
          visitor_id: 'count'
        }
      }
    end

    protected

    def query(
      start_at: nil,
      end_at: nil,
      resolution: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      time_series_query = {
        fact: 'registration',
        filters: {
          **date_filter('dimension_date_registration', start_at, end_at)
        },
        groups: "dimension_date_registration.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          'dimension_date_registration.date': 'first'
        }
      }

      registrations_whole_period_query = registrations_query(start_at, end_at)
      visitors_whole_period_query = visitors_query(start_at, end_at)

      # Similar to active_users.rb, we request the registrations another
      # time, but this time we filter by has_visits = true
      registrations_visitors_whole_period_query = registrations_query(
        start_at, end_at, apply_visitor_filter: true
      )

      queries = [
        time_series_query,
        registrations_whole_period_query,
        visitors_whole_period_query,
        registrations_visitors_whole_period_query
      ]

      if compare_start_at.present? && compare_end_at.present?
        registrations_compared_period_query = registrations_query(compare_start_at, compare_end_at)
        visitors_compared_period_query = visitors_query(compare_start_at, compare_end_at)

        # Similar to active_users.rb, we request the registrations another
        # time, but this time we filter by has_visits = true
        registrations_visitors_compared_period_query = registrations_query(
          compare_start_at, compare_end_at, apply_visitor_filter: true
        )

        queries << registrations_compared_period_query
        queries << visitors_compared_period_query
        queries << registrations_visitors_compared_period_query
      end

      queries
    end
  end
end
