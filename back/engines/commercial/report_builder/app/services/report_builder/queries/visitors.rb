module ReportBuilder
  class Queries::Visitors < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      resolution: 'month',
      project_id: nil,
      compare_start_at: nil,
      compare_end_at: nil
    )
      validate_resolution(resolution)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      sessions = ImpactTracking::Session.where(created_at: start_date..end_date)
      sessions = apply_project_filter_if_needed(sessions, project_id)

      visitors_timeseries = sessions
        .select(
          "count(*) as visits, count(distinct(monthly_user_hash)) as visitors, date_trunc('#{resolution}', created_at) as date_group"
        )
        .group('date_group')
        .order('date_group')
        .map do |row|
          {
            visits: row.visits,
            visitors: row.visitors,
            date_group: row.date_group.to_date
          }
        end

      stats = calculate_stats(sessions, project_id)

      response = {
        visitors_timeseries: visitors_timeseries,
        visits_whole_period: stats[:visits],
        visitors_whole_period: stats[:visitors],
        avg_seconds_on_page_whole_period: stats[:avg_seconds_on_page],
        avg_pages_visited_whole_period: stats[:avg_pages_visited],
      }

      # If compare_start_at and compare_end_at are present:
      if compare_start_at.present? && compare_end_at.present?
        compare_sessions = ImpactTracking::Session.where(created_at: compare_start_at..compare_end_at)
        compare_sessions = apply_project_filter_if_needed(compare_sessions, project_id)

        compare_stats = calculate_stats(compare_sessions, project_id)

        response = {
          **response,
          visits_compared_period: compare_stats[:visits],
          visitors_compared_period: compare_stats[:visitors],
          avg_seconds_on_page_compared_period: compare_stats[:avg_seconds_on_page],
          avg_pages_visited_compared_period: compare_stats[:avg_pages_visited]
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
      visits = sessions.count
      visitors = sessions.distinct.pluck(:monthly_user_hash).count

      # Avg pages visited per session
      pageviews = ImpactTracking::Pageview.where(session_id: sessions.select(:id))

      # Avg seconds on page

      # Here we need to apply the project filter too on the subquery.
      # We already sort of applied this filter above, when we did apply_project_filter_if_needed.
      # However, with just that step, we're saying
      # "give me the average time spent per page during sessions where someone visited the project"
      # while what we probably want is
      # "give me the average time spent on project page"
      # So we need to apply the filter again here.
      additional_select_statement = ''

      if project_id.present?
        additional_select_statement = ', project_id'
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

      additional_where_clause = ''

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

      secs_sum = aggregations['sum'] || 0
      secs_count = aggregations['count'] || 0
      avg_seconds_on_page = secs_count == 0 ? 0 : secs_sum / secs_count

      # Avg pages visited per sessions
      # Or, if project filter is applied:
      # Avg pages visited per session where someone visited the project during the session
      pageviews.count || 0
      avg_pages_visited = visits == 0 ? 0 : pageviews.count / visits

      {
        visits: visits,
        visitors: visitors,
        avg_seconds_on_page: avg_seconds_on_page,
        avg_pages_visited: avg_pages_visited
      }
    end
  end
end
