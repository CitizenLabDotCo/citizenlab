module ReportBuilder
  class Queries::Analytics::Registrations < Queries::Analytics::Base
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
        fact: 'registration',
        filters: {
          **date_filter('dimension_date_registration', start_at, end_at)
        },
        groups: "dimension_date_registration.#{interval(resolution)}",
        aggregations: {
          all: 'count',
          'dimension_date_registration.date': 'first'
        }
      }

      registrations_whole_period_query = {
        fact: 'registration',
        filters: {
          **date_filter('dimension_date_registration', start_at, end_at)
        },
        aggregations: {
          all: 'count'
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

      # TODO: registrations filtered by is_visitor = true

      [
        time_series_query,
        registrations_whole_period_query,
        visitors_whole_period_query
      ]

      # TODO: compared period
    end
  end
end
