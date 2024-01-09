module ReportBuilder
  class Queries::Analytics::ReactionsByTime < Queries::Analytics::Base
    protected

    def query(start_at: nil, end_at: nil, project_id: nil, resolution: nil, **_other_props)
      time_series_query = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'reaction',
          'dimension_type.parent': 'idea'
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          'dimension_date_created.date': 'first',
          likes_count: 'sum',
          dislikes_count: 'sum'
        }
      }

      posts_by_time_total = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'reaction',
          'dimension_type.parent': 'idea'
        },
        aggregations: {
          reactions_count: 'sum'
        }
      }

      [time_series_query, posts_by_time_total]
    end
  end
end
