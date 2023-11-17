# rubocop:disable Naming/VariableName
module ReportBuilder
  class Queries::ReactionsByTime < Queries::Base
    def query(startAt: nil, endAt: nil, projectId: nil, **_other_props)
      # TODO: do we need these ||=?
      # startAt ||= Date.parse('2017-01-01')
      # endAt ||= Time.zone.today
      resolution = RESOLUTION_TO_INTERVAL.fetch('month')

      time_series_query = {
        fact: 'participation',
        filters: {
          **date_filter('dimension_date_created', startAt, endAt),
          **project_filter('dimension_project', projectId),
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
          **date_filter('dimension_date_created', startAt, endAt),
          **project_filter('dimension_project', projectId),
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
# rubocop:enable Naming/VariableName
