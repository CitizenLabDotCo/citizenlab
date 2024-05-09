module ReportBuilder
  class Queries::Analytics::ActiveUsers < Queries::Analytics::Base
    protected

    def query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      time_series_query = {
        fact: 'participation',
        filters: {
          **project_filter('dimension_project_id', project_id),
          **date_filter('dimension_date_created', start_at, end_at)
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          participant_id: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      active_users_whole_period_query = {
        fact: 'participation',
        filters: {
          **project_filter('dimension_project_id', project_id),
          **date_filter('dimension_date_created', start_at, end_at)
        },
        aggregations: {
          participant_id: 'count'
        }
      }

      visitors_whole_period_query = {
        fact: 'visit',
        filters: {
          **project_filter('dimension_projects.id', project_id),
          **date_filter('dimension_date_first_action', start_at, end_at)
        },
        aggregations: {
          visitor_id: 'count'
        }
      }

      queries = [
        time_series_query,
        active_users_whole_period_query,
        visitors_whole_period_query
      ]

      if compare_start_at.present? && compare_end_at.present?
        active_users_compared_period_query = {
          fact: 'participation',
          filters: {
            **project_filter('dimension_project_id', project_id),
            **date_filter(
              'dimension_date_created', compare_start_at, compare_end_at
            )
          },
          aggregations: {
            participant_id: 'count'
          }
        }

        visitors_compared_period_query = {
          fact: 'visit',
          filters: {
            **project_filter('dimension_projects.id', project_id),
            **date_filter('dimension_date_first_action', compare_start_at, compare_end_at)
          },
          aggregations: {
            visitor_id: 'count'
          }
        }

        queries << active_users_compared_period_query
        queries << visitors_compared_period_query
      end

      queries
    end
  end
end
