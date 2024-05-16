module ReportBuilder
  class Queries::Analytics::Visitors < Queries::Analytics::Base
    def visit_aggregations_query(start_at, end_at, project_id)
      {
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
    end

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

      totals_whole_period_query = visit_aggregations_query(
        start_at, end_at, project_id
      )

      queries = [time_series_query, totals_whole_period_query]

      if compare_start_at.present? && compare_end_at.present?
        totals_compared_period_query = visit_aggregations_query(
          start_at, end_at, project_id
        )

        queries << totals_compared_period_query
      end

      queries
    end
  end
end
