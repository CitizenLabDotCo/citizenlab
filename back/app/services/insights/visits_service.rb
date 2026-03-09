module Insights
  class VisitsService
    def sessions(project_id, start_at: nil, end_at: nil, exclude_roles: nil)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse
      if project_id
        project_visits(project_id, start_date, end_date, exclude_roles)
      else
        platform_visits(start_date, end_date, exclude_roles)
      end
    end

    def totals(sessions)
      result = sessions.select("count(*) as visits,
    count(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors")[0]
      { visits: result.visits, visitors: result.visitors }
    end

    def group_by_date(sessions, resolution)
      sessions.select("count(*) as visits,
count(DISTINCT COALESCE(CAST(user_id AS TEXT), monthly_user_hash)) as visitors,
date_trunc('#{resolution}', created_at) as date_group")
            .group('date_group')
            .order('date_group')
    end

    def page_views(sessions)
      ImpactTracking::Pageview.where(session_id: sessions.select(:id))
    end

    # def phase_visits(phase)
    #   visits = visits(phase.project_id, start_at: phase.start_at, end_at: phase.end_at)
    #   visits.select("impact_tracking_pageviews.created_at AS acted_at,
    #     impact_tracking_sessions.id AS session_id,
    #     COALESCE(CAST(impact_tracking_sessions.user_id AS TEXT), impact_tracking_sessions.monthly_user_hash) AS visitor_id")
    # end

    private

    def platform_visits(start_date, end_date, exclude_roles)
      # TODO: Actually we should count the number of sessions that had pageviews in the period
      visits = ImpactTracking::Session.where(created_at: start_date..end_date)
      exclude_roles(visits, exclude_roles)
    end

    # For project visits we want to count the date that they visited the project, not the date they started the session.
    def project_visits(project_id, start_date, end_date, exclude_roles)
      sessions_with_project = ImpactTracking::Pageview.where(project_id: project_id, created_at: start_date..end_date).select(:session_id)
      visits = ImpactTracking::Session.where(id: sessions_with_project)
      exclude_roles(visits, exclude_roles)
    end

    def exclude_roles(visits, exclude_roles)
      return visits unless exclude_roles == 'exclude_admins_and_moderators'

      visits.where("highest_role IS NULL OR highest_role = 'user'")
    end
  end
end
