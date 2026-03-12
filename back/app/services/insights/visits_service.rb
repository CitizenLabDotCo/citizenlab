module Insights
  class VisitsService
    # Definition of a visit - a session where a pageview happened
    # When filtered by date - a session where a pageview has a date in the period
    def initialize(project_id, start_at: nil, end_at: nil, exclude_roles: nil)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse
      @project_id = project_id
      @start_date = start_date
      @end_date = end_date
      @exclude_roles = exclude_roles
    end

    def total_visits
      result = filtered_page_views.select("
        count(DISTINCT session_id) as visits,
        count(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors
      ")[0]
      { visits: result.visits, visitors: result.visitors }
    end

    def visits_by_date(resolution)
      result = filtered_page_views.select("
        count(DISTINCT session_id) as visits,
        count(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors,
        date_trunc('#{resolution}', impact_tracking_pageviews.created_at) as date_group
      ")
        .group('date_group')
        .order('date_group')
      result.map do |row|
        {
          visits: row.visits,
          visitors: row.visitors,
          date_group: resolution == 'hour' ? row.date_group.to_datetime : row.date_group.to_date
        }
      end
    end

    # Because we want to calculate timings based on all page views of sessions that had a page view in the period,
    # we need to get all page views of for the sessions, even the ones outside the period.
    def all_page_views_for_sessions
      ImpactTracking::Pageview.where(session_id: filtered_page_views.pluck(:session_id).uniq)
    end

    private

    # Sessions with page views in the period
    def filtered_page_views
      page_views = ImpactTracking::Pageview
                     .joins(:session)
                     .where(created_at: @start_date..@end_date)
      page_views = page_views.where(project_id: @project_id) if @project_id
      page_views = page_views.where("highest_role IS NULL OR highest_role = 'user'") if @exclude_roles == 'exclude_admins_and_moderators'
      page_views
    end
  end
end
