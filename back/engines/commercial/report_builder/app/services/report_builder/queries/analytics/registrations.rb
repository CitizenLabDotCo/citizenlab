module ReportBuilder
  class Queries::Analytics::Registrations < Queries::Analytics::Base
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

      registrations_whole_period_query = {
        fact: 'registration',
        filters: {
          **date_filter('dimension_date_registration', start_at, end_at)
        },
        aggregations: {
          all: 'count'
        }
      }

      visitors_whole_period_query = {
        fact: 'visit',
        filters: {
          **date_filter('dimension_date_first_action', start_at, end_at)
        },
        aggregations: {
          visitor_id: 'count'
        }
      }

      registrations_visitors_whole_period_query = {
        fact: 'registration',
        filters: {
          **date_filter('dimension_date_registration', start_at, end_at),
          'dimension_user.is_visitor': 'true'
        },
        aggregations: {
          all: 'count'
        }
      }

      queries = [
        time_series_query,
        registrations_whole_period_query,
        visitors_whole_period_query,
        registrations_visitors_whole_period_query
      ]

      if compare_start_at.present? && compare_end_at.present?
        registrations_compared_period_query = {
          fact: 'registration',
          filters: {
          **date_filter('dimension_date_registration', compare_start_at, compare_end_at)
          },
          aggregations: {
            all: 'count'
          }
        }

        visitors_compared_period_query = {
          fact: 'visit',
          filters: {
          **date_filter('dimension_date_first_action', compare_start_at, compare_end_at)
          },
          aggregations: {
            visitor_id: 'count'
          }
        }

        registrations_visitors_compared_period_query = {
          fact: 'registration',
          filters: {
            **date_filter('dimension_date_registration', compare_start_at, compare_end_at),
            'dimension_user.is_visitor': 'true'
          },
          aggregations: {
            all: 'count'
          }
        }

        queries << registrations_compared_period_query
        queries << visitors_compared_period_query
        queries << registrations_visitors_compared_period_query
      end

      queries
    end
  end
end
