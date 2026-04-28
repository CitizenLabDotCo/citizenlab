module Insights
  class VisitsService
    # Definition of a visit - a session where a pageview happened
    # When filtered by date - a session where a pageview has a date in the period
    def initialize(project_id, start_at: nil, end_at: nil, exclude_roles: nil)
      @start_at, @end_at = TimeBoundaries.parse(start_at, end_at)
      @project_id = project_id
      @exclude_roles = exclude_roles
    end

    # Totals only needs the sessions
    def total_visits
      result = filtered_sessions_query
      result = result.select("
        COUNT(*) as visits,
        COUNT(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors
      ")
      row = result[0]
      { visits: row&.visits || 0, visitors: row&.visitors || 0 }
    end

    # Grouping needs to join page views to session to be able to group by the date of each page view
    # @param [String] resolution - hour|day|month|year
    def visits_by_date(resolution)
      filtered_page_views_query
        .select(sanitize_sql(<<~SQL.squish, resolution, Time.zone.name))
          COUNT(DISTINCT session_id) as visits,
          COUNT(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors,
          DATE_TRUNC(?, impact_tracking_pageviews.created_at at time zone 'UTC' at time zone ?) as date_group
        SQL
        .group('date_group')
        .order('date_group')
        .map do |row|
          {
            visits: row.visits,
            visitors: row.visitors,
            date_group: resolution == 'hour' ? row.date_group.to_datetime : row.date_group.to_date
          }
        end
    end

    # Because we want to calculate timings based on all page views of sessions that had a page view in the period,
    # we need to get all page views of for the sessions, even the ones outside the period.
    def all_page_views_query
      ImpactTracking::Pageview.where(session_id: session_ids_excluding_roles)
    end

    def filtered_sessions_query
      exclude_session_roles(ImpactTracking::Session.where(id: session_ids))
    end

    def filtered_page_views_query
      result = filtered_page_views_root_query.joins(:session)
      result = exclude_session_roles(result) if @exclude_roles
      result
    end

    private

    def filtered_page_views_root_query
      page_views = ImpactTracking::Pageview.where(created_at: @start_at...@end_at)
      page_views = page_views.where(project_id: @project_id) if @project_id
      page_views
    end

    def session_ids
      @session_ids ||= filtered_page_views_root_query.pluck(:session_id).uniq
    end

    # NOTE: An extra query is needed when excluding roles
    def session_ids_excluding_roles
      @session_ids_excluding_roles ||= @exclude_roles ? filtered_sessions_query.pluck(:id).uniq : session_ids
    end

    def exclude_session_roles(query)
      return query unless @exclude_roles == 'exclude_admins_and_moderators'

      query.where("highest_role IS NULL OR highest_role = 'user'")
    end

    def sanitize_sql(*args)
      ActiveRecord::Base.sanitize_sql_array(args)
    end
  end
end
