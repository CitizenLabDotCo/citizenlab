module ReportBuilder
  class Queries::Visitors < ReportBuilder::Queries::Base
    def transform_response(untransformed_response)
      time_series = untransformed_response[:time_series].map do |row|
        {
          'count' => row[:visits],
          'count_monthly_user_hash' => row[:visitors],
          'dimension_date_created.month' => row[:date_group].strftime('%Y-%m'),
          'first_dimension_date_created_date' => row[:date_group]
        }
      end

      totals = [{
        'count' => untransformed_response[:visits_total],
        'count_monthly_user_hash' => untransformed_response[:visitors_total]
      }]

      averages = [{
        'avg_duration' => untransformed_response[:avg_seconds_on_page],
        'avg_pages_visited' => untransformed_response[:avg_pages_visited]
      }]

      response = [time_series, totals, averages]

      if untransformed_response[:compare_visits_total].present?
        compared_totals = [{
          'count' => untransformed_response[:compare_visits_total],
          'count_monthly_user_hash' => untransformed_response[:compare_visitors_total]
        }]

        compared_averages = [{
          'avg_duration' => untransformed_response[:compare_avg_seconds_on_page],
          'avg_pages_visited' => untransformed_response[:compare_avg_pages_visited]
        }]

        response = [
          *response,
          compared_totals,
          compared_averages
        ]
      end

      response
    end

    def run_query_untransformed(
      start_at, 
      end_at,
      resolution: 'month',
      project_id: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      sessions = ImpactTracking::Session.where(created_at: start_at..end_at)
      sessions = apply_project_filter_if_needed(sessions, project_id)

      time_series = sessions
        .select(
          "count(*) as visits, count(distinct(monthly_user_hash)) as visitors, date_trunc('#{resolution}', created_at) as date_group"
        )
        .group("date_group")
        .order("date_group")
        .map do |row|
          {
            visits: row.visits,
            visitors: row.visitors,
            date_group: row.date_group.to_date
          }
        end

      stats = calculate_stats(sessions, project_id)

      response = {
        time_series: time_series,
        **stats
      }

      # If compare_start_at and compare_end_at are present:
      if compare_start_at.present? && compare_end_at.present?
        compare_sessions = ImpactTracking::Session.where(created_at: compare_start_at..compare_end_at)
        compare_sessions = apply_project_filter_if_needed(compare_sessions, project_id)

        compare_stats = calculate_stats(compare_sessions, project_id)

        response = {
          **response,
          compare_visits_total: compare_stats[:visits_total],
          compare_visitors_total: compare_stats[:visitors_total],
          compare_avg_seconds_on_page: compare_stats[:avg_seconds_on_page],
          compare_avg_pages_visited: compare_stats[:avg_pages_visited]
        }
      end

      response
    end

    def apply_project_filter_if_needed(sessions, project_id)
      if project_id.present?
        sessions_with_project = ImpactTracking::Pageview.where(project_id: project_id).select(:session_id)
        sessions = sessions.where(id: sessions_with_project)
      end

      sessions
    end

    def calculate_stats(sessions, project_id)
      # Total number of visits and visitors
      visits_total = sessions.count
      visitors_total = sessions.distinct.pluck(:monthly_user_hash).count

      ### Avg seconds on page, and avg pages visited per session
      pageviews = ImpactTracking::Pageview.where(session_id: sessions.select(:id))

      # Avg seconds on page

      # Here we need to apply the project filter too on the subquery.
      # We already sort of applied this filter above, when we did apply_project_filter_if_needed.
      # However, with just that step, we're saying 
      # "give me the average time spent per page during sessions where someone visited the project"
      # while what we probably want is
      # "give me the average time spent on project page"
      # So we need to apply the filter again here.
      additional_select_statement = ""

      if project_id.present?
        additional_select_statement = ", project_id"
      end

      seconds_on_page_subqery = pageviews
        .select(
          <<-SQL.squish
            extract(epoch from
              (lead(created_at,1) over (partition by session_id order by created_at)) - created_at
            ) as seconds_on_page #{additional_select_statement}
          SQL
        )
        .to_sql

      additional_where_clause = ""

      if project_id.present?
        additional_where_clause = "and project_id = '#{project_id}'"
      end

      seconds_on_page_query = ActiveRecord::Base.connection.execute(
        <<-SQL.squish
          select
            count(subquery.seconds_on_page) as count,
            sum(subquery.seconds_on_page) as sum
          from (#{seconds_on_page_subqery}) as subquery
          where subquery.seconds_on_page is not null #{additional_where_clause}
        SQL
      )

      aggregations = seconds_on_page_query.to_a[0]
      avg_seconds_on_page = aggregations["sum"] / aggregations["count"]

      # Avg pages visited per sessions
      # Or, if project filter is applied:
      # Avg pages visited per session where someone visited the project during the session
      avg_pages_visited = pageviews.count / visits_total

      {
        visits_total: visits_total,
        visitors_total: visitors_total,
        avg_seconds_on_page: avg_seconds_on_page,
        avg_pages_visited: avg_pages_visited
      }
    end
  end
end
