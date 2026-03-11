module Insights
  class VisitsService
    # Single, simple definition of visit - filter sessions where a pageview happened in the period
    def initialize(project_id, start_at: nil, end_at: nil, exclude_roles: nil)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      constraints = { created_at: start_date..end_date }
      constraints[:project_id] = project_id if project_id.present?

      @filtered_page_views = ImpactTracking::Pageview
        .joins(:session)
        .where(constraints)
      if exclude_roles == 'exclude_admins_and_moderators'
        @filtered_page_views = @filtered_page_views.where("highest_role IS NULL OR highest_role = 'user'")
      end
    end

    def total_visits
      result = @filtered_page_views.select("count(DISTINCT session_id) as visits,
    count(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors")[0]
      { visits: result.visits, visitors: result.visitors }
    end

    def visits_by_date(resolution)
      result = @filtered_page_views.select("count(DISTINCT session_id) as visits,
count(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors,
date_trunc('#{resolution}', impact_tracking_pageviews.created_at) as date_group")
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

    # All page views for the sessions in the period, used for calculating timings and pages per session
    # @filtered_page_views only includes those relevant to the filters
    def all_session_page_views
      ImpactTracking::Pageview.where(session_id: @filtered_page_views.pluck(:session_id).uniq)
    end
  end
end
