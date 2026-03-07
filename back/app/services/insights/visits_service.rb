module Insights
  class VisitsService
    def visits(project_id, start_at: nil, end_at: nil, exclude_roles: nil)
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse
      if project_id
        project_visits(project_id, start_date, end_date, exclude_roles)
      else
        platform_visits(start_date, end_date, exclude_roles)
      end
    end

    def phase_visits(phase)
      visits(phase.project.id, start_at: phase.start_at, end_at: phase.end_at)
    end

    private

    def platform_visits(start_date, end_date, exclude_roles)
      visits = ImpactTracking::Session.where(created_at: start_date..end_date)
      visits = exclude_roles(visits, exclude_roles)
      visits.select(
        "created_at AS acted_at,
          id AS session_id,
          COALESCE(CAST(user_id AS TEXT), monthly_user_hash) AS visitor_id"
      )
    end

    # For project visits we want to count the date that they visited the project, not the date they started the session.
    def project_visits(project_id, start_date, end_date, exclude_roles)
      visits = ImpactTracking::Session
        .joins(:pageviews)
        .where(impact_tracking_pageviews: {
          project_id: project_id,
          created_at: start_date..end_date
        })
      visits = exclude_roles(visits, exclude_roles)
      visits.select(
        "impact_tracking_pageviews.created_at AS acted_at,
          impact_tracking_sessions.id AS session_id,
          COALESCE(CAST(impact_tracking_sessions.user_id AS TEXT), impact_tracking_sessions.monthly_user_hash) AS visitor_id"
      )
    end

    def exclude_roles(visits, exclude_roles)
      return visits unless exclude_roles == 'exclude_admins_and_moderators'

      visits.where("highest_role IS NULL OR highest_role = 'user'")
    end
  end
end
