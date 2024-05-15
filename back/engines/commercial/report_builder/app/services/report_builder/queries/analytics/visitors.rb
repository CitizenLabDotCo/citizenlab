module ReportBuilder
  class Queries::Analytics::Visitors < Queries::Analytics::Base
    protected

    def query(start_at: nil, end_at: nil, project_id: nil, resolution: nil, **_other_props)
      time_series_query = {
        fact: 'visit',
        filters: {
          **project_filter('dimension_projects.id', project_id),
          **date_filter(
            'dimension_date_first_action',
            start_at,
            end_at
          )
        },
        groups: "dimension_date_first_action.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          visitor_id: 'count',
          'dimension_date_first_action.date': 'first'
        }
      }

      totals_whole_period_query = {
        fact: 'visit',
        filters: {
          **project_filter('dimension_projects.id', project_id),
          **date_filter(
            'dimension_date_first_action',
            start_at,
            end_at
          )
        },
        aggregations: {
          all: 'count',
          visitor_id: 'count',
          duration: 'avg',
          pages_visited: 'avg'
        }
      }

      [time_series_query, totals_whole_period_query]
    end
  end
end
