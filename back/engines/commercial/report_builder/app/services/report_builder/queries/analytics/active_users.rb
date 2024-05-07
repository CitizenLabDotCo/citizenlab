module ReportBuilder
  class Queries::Analytics::ActiveUsers < Queries::Analytics::Base
    def query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: nil,
      compare_previous_period: nil,
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

      queries = [time_series_query, active_users_whole_period_query]

      if start_at.present? && end_at.present? && compare_previous_period == true
        previous_period_start_at, previous_period_end_at = previous_period_dates(start_at, end_at)

        active_users_previous_period_query = {
          fact: 'participation',
          filters: {
            **project_filter('dimension_project_id', project_id),
            **date_filter('dimension_date_created', previous_period_start_at, previous_period_end_at)
          },
          aggregations: {
            participant_id: 'count'
          }
        }

        queries << active_users_previous_period_query
      end

      queries
    end

    private

    def previous_period_dates(start_at, end_at)
      previous_period_start_at = start_at - (end_at - start_at) - 1.day
      previous_period_end_at = start_at - 1.day

      [previous_period_start_at, previous_period_end_at]
    end
  end
end
