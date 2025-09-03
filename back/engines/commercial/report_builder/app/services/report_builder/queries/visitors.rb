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

      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      sessions = ImpactTracking::Session.where(created_at: start_date..end_date)
      sessions = apply_project_filter_if_needed(sessions, project_id)
      sessions = exclude_roles_if_needed(sessions, exclude_roles)

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

      stats = calculate_stats(sessions)

      response = {
        visitors_timeseries: visitors_timeseries,
        visits_whole_period: stats[:visits],
        visitors_whole_period: stats[:visitors],
        avg_seconds_per_session_whole_period: stats[:avg_seconds_per_session],
        avg_pages_visited_whole_period: stats[:avg_pages_visited]
      }

      # If compare_start_at and compare_end_at are present:
      if compare_start_at.present? && compare_end_at.present?
        compare_sessions = ImpactTracking::Session.where(created_at: compare_start_at..compare_end_at)
        compare_sessions = apply_project_filter_if_needed(compare_sessions, project_id)
        compare_sessions = exclude_roles_if_needed(compare_sessions, exclude_roles)

        compare_stats = calculate_stats(compare_sessions)

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

    def apply_project_filter_if_needed(sessions, project_id)
      if project_id.present?
        sessions_with_project = ImpactTracking::Pageview.where(project_id: project_id).select(:session_id)
        sessions = sessions.where(id: sessions_with_project)
      end

      sessions
    end

    def exclude_roles_if_needed(sessions, exclude_roles)
      if exclude_roles == 'exclude_admins_and_moderators'
        sessions = sessions
          .where("highest_role IS NULL OR highest_role = 'user'")
      end

      sessions
    end

    def calculate_stats(sessions)
      # Total number of visits and visitors
      visits = sessions.count
      visitors = sessions.distinct.pluck(:monthly_user_hash).count

      # Create new pageviews query for avg seconds per session and avg pages per session
      pageviews = ImpactTracking::Pageview.where(session_id: sessions.select(:id))

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
  end
end
