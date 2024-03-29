module ReportBuilder
  class Queries::Analytics::ActiveUsers < Queries::Analytics::Base
    protected

    def query(start_at: nil, end_at: nil, project_id: nil, resolution: nil, **_other_props)
      time_series_query = {
        fact: 'participation',
        filters: {
          'dimension_user.role': ['citizen', nil],
          **project_filter('dimension_project_id', project_id),
          **date_filter('dimension_date_created', start_at, end_at)
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          dimension_user_id: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      active_users_whole_period_query = {
        fact: 'participation',
        filters: {
          'dimension_user.role': ['citizen', nil],
          **project_filter('dimension_project_id', project_id),
          **date_filter('dimension_date_created', start_at, end_at)
        },
        aggregations: {
          dimension_user_id: 'count'
        }
      }

      [time_series_query, active_users_whole_period_query]
    end
  end
end
