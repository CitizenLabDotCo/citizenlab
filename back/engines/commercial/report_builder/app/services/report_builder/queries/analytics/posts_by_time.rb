module ReportBuilder
  class Queries::Analytics::PostsByTime < Queries::Analytics::Base
    protected

    def query(start_at: nil, end_at: nil, project_id: nil, resolution: nil, **_other_props)
      time_series_query = {
        fact: 'post',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'idea',
          publication_status: 'published'
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          'dimension_date_created.date': 'first'
        }
      }

      posts_by_time_total = {
        fact: 'post',
        filters: {
          **date_filter('dimension_date_created', nil, end_at),
          **project_filter('dimension_project_id', project_id),
          'dimension_type.name': 'idea',
          publication_status: 'published'
        },
        aggregations: {
          all: 'count'
        }
      }

      [time_series_query, posts_by_time_total]
    end
  end
end
