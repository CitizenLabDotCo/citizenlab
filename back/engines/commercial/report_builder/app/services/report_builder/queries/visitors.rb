module ReportBuilder
  class Queries::Visitors < ReportBuilder::Queries::Base
    # Calculates visitor timeseries and other statistics over specified time periods
    # @param start_at [String, Date] Beginning of analysis period (YYYY-MM-DD)
    # @param end_at [String, Date] End of analysis period (YYYY-MM-DD)
    # @param project_id [String] Optional project ID to filter participants
    # @param exclude_roles [<String>] Flag to exclude certain roles from participant counts ('exclude_admins_and_moderators')
    # @param resolution [String] Time grouping ('day', 'week', or 'month')
    # @return [Hash] Visitor timeseries and other statisticsrates
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      resolution: 'month',
      exclude_roles: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      validate_resolution(resolution)

      sessions = visits_service.sessions(project_id, start_at:, end_at:, exclude_roles:)
      visitors_timeseries = visits_service.group_by_date(sessions, resolution).map do |row|
          {
            visits: row.visits,
            visitors: row.visitors,
            date_group: row.date_group.to_date
          }
      end

      page_views = visits_service.page_views(sessions)
      totals = visits_service.totals(sessions)
      stats = calculate_stats(totals, page_views)

      response = {
        visitors_timeseries: visitors_timeseries,
        visits_whole_period: stats[:visits],
        visitors_whole_period: stats[:visitors],
        avg_seconds_per_session_whole_period: stats[:avg_seconds_per_session],
        avg_pages_visited_whole_period: stats[:avg_pages_visited]
      }

      # If compare_start_at and compare_end_at are present:
      if compare_start_at.present? && compare_end_at.present?
        compare_sessions = visits_service.sessions(project_id, start_at: compare_start_at, end_at: compare_end_at, exclude_roles: exclude_roles)
        compare_page_views = visits_service.page_views(compare_sessions)
        compare_totals = visits_service.totals(compare_sessions)
        compare_stats = calculate_stats(compare_totals, compare_page_views)

        response = {
          **response,
          visits_compared_period: compare_stats[:visits],
          visitors_compared_period: compare_stats[:visitors],
          avg_seconds_per_session_compared_period: compare_stats[:avg_seconds_per_session],
          avg_pages_visited_compared_period: compare_stats[:avg_pages_visited]
        }
      end

      response
    end

    def calculate_stats(totals, pageviews)
      # Total number of visits and visitors
      visits = totals[:visits]
      visitors = totals[:visitors]

      # avg seconds per session and avg pages per session from pageview data
      # Calculate avg pages visited per session
      # Or, if project filter is applied:
      # Avg pages visited per session where someone visited the project during the session
      # ALSO: here we only sessions that have pageviews, otherwise we might
      # also count sessions without pageviews (from before we collected pageview data)
      visits_with_pageviews = pageviews.select(:session_id).distinct.count
      avg_pages_visited = visits_with_pageviews == 0 ? 0 : pageviews.count / visits_with_pageviews.to_f

      # Avg seconds per session
      # Because we can only know the time spent on a page if there is
      # a next page, we can't just calculate the difference between the
      # created_at of the first and last page during a session. Because
      # this would not include the last page.
      # This might not be a problem if every session has a ton of page
      # views, but assuming most session will be relatively short,
      # this would be a problem and would lead to a too low average.
      # So instead, we calculate the average time spent per page
      # insofar as we know, and then multiply this by the average
      # number of pages per session. This should probably give a pretty
      # ok approximation of the average time spent on a session.
      seconds_on_page_subqery = pageviews
        .select(
          <<-SQL.squish
            extract(epoch from
              (lead(created_at,1) over (partition by session_id order by created_at)) - created_at
            ) as seconds_on_page
          SQL
        )
        .to_sql

      seconds_on_page_query = ActiveRecord::Base.connection.execute(
        <<-SQL.squish
          select
            count(subquery.seconds_on_page) as count,
            sum(subquery.seconds_on_page) as sum
          from (#{seconds_on_page_subqery}) as subquery
          where subquery.seconds_on_page is not null and subquery.seconds_on_page <= 720
        SQL
      )

      aggregations = seconds_on_page_query.to_a[0]

      secs_sum = aggregations['sum'] || 0
      secs_count = aggregations['count'] || 0
      avg_seconds_on_page = secs_count == 0 ? 0 : secs_sum / secs_count.to_f

      avg_seconds_per_session = avg_seconds_on_page * avg_pages_visited

      {
        visits: visits,
        visitors: visitors,
        avg_seconds_per_session: avg_seconds_per_session,
        avg_pages_visited: avg_pages_visited
      }
    end

    def visits_service
      @visits_service ||= Insights::VisitsService.new
    end
  end
end
