module ReportBuilder
  class Queries::Analytics::ReactionsByTime < Queries::Analytics::Base
    protected

    def query(start_at: nil, end_at: nil, project_id: nil, resolution: nil, **_other_props)
      likes_time_series_query = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          action_type: 'idea_liked'
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          'dimension_date_created.date': 'first',
          reaction_id: 'count'
        }
      }

      dislikes_time_series_query = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          action_type: 'idea_disliked'
        },
        groups: "dimension_date_created.#{interval(resolution)}",
        aggregations: {
          'dimension_date_created.date': 'first',
          reaction_id: 'count'
        }
      }

      posts_by_time_total = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', start_at, end_at),
          **project_filter('dimension_project_id', project_id),
          reactable_type: 'Idea'
        },
        aggregations: {
          reaction_id: 'count'
        }
      }

      [likes_time_series_query, dislikes_time_series_query, posts_by_time_total]
    end
  end
end
