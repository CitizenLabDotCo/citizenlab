module ReportBuilder
  class Queries::Analytics::Participants < Queries::Analytics::Base
    def participants_query(start_at, end_at, project_id, apply_visitor_filter: false)
      {
        fact: 'participation',
        filters: {
          **project_filter('dimension_project_id', project_id),
          **date_filter('dimension_date_created', start_at, end_at),
          **visitor_filter(apply_visitor_filter)
        },
        aggregations: {
          participant_id: 'count'
        }
      }
    end

    def visitors_query(start_at, end_at, project_id)
      {
        fact: 'visit',
        filters: {
            **project_filter('dimension_projects.id', project_id),
            **date_filter('dimension_date_first_action', start_at, end_at)
        },
        aggregations: {
          visitor_id: 'count'
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

      participants_whole_period_query = participants_query(start_at, end_at, project_id)
      visitors_whole_period_query = visitors_query(start_at, end_at, project_id)

      # We request the participants count again,
      # but this time we filter by has_visits = true
      # This is so that we can calculate a more accurate
      # conversion rate on the FE, where we only compare
      # visitors (i.e. people that accepted cookies)
      # to participants that also accepted cookies
      participants_who_accepted_cookies_whole_period_query = participants_query(
        start_at, end_at, project_id, apply_visitor_filter: true
      )

      queries = [
        time_series_query,
        participants_whole_period_query,
        visitors_whole_period_query,
        participants_who_accepted_cookies_whole_period_query
      ]

      if compare_start_at.present? && compare_end_at.present?
        participants_compared_period_query = participants_query(compare_start_at, compare_end_at, project_id)
        visitors_compared_period_query = visitors_query(compare_start_at, compare_end_at, project_id)

        # We request the participants count again,
        # but this time we filter by has_visits = true
        # This is so that we can calculate a more accurate
        # conversion rate on the FE, where we only compare
        # visitors (i.e. people that accepted cookies)
        # to participants that also accepted cookies
        participants_who_accepted_cookies_compared_period_query = participants_query(
          compare_start_at, compare_end_at, project_id, apply_visitor_filter: true
        )

        queries << participants_compared_period_query
        queries << visitors_compared_period_query
        queries << participants_who_accepted_cookies_compared_period_query
      end

      queries
    end
  end
end
