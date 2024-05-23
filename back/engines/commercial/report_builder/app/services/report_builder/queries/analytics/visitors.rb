module ReportBuilder
  class Queries::Analytics::Visitors < Queries::Analytics::Base
    def session_aggregations_query(start_at, end_at)
      {
        fact: 'session',
        filters: {
          **date_filter(
            'dimension_date_created',
            start_at,
            end_at
          )
        },
        aggregations: {
          all: 'count',
          monthly_user_hash: 'count'
        }
      }
    end

    def matomo_visit_aggregations_query(start_at, end_at)
      {
        fact: 'visit',
        filters: {
          **date_filter(
            'dimension_date_first_action',
            start_at,
            end_at
          )
        },
        aggregations: {
          duration: 'avg',
          pages_visited: 'avg'
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
        fact: 'session',
        filters: {
          **date_filter(
            'dimension_date_created',
            start_at,
            end_at
          )
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          monthly_user_hash: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      total_sessions_whole_period_query = session_aggregations_query(
        start_at, end_at
      )

      total_matomo_visits_whole_period_query = matomo_visit_aggregations_query(
        start_at, end_at
      )

      queries = [
        time_series_query,
        total_sessions_whole_period_query,
        total_matomo_visits_whole_period_query
      ]

      if compare_start_at.present? && compare_end_at.present?
        total_sessions_compared_period_query = session_aggregations_query(
          compare_start_at, compare_end_at
        )

        total_matomo_visits_compared_period_query = matomo_visit_aggregations_query(
          compare_start_at, compare_end_at
        )

        queries << total_sessions_compared_period_query
        queries << total_matomo_visits_compared_period_query
      end

      queries
    end
  end
end
