module ReportBuilder
  class Queries::TrafficSources < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      exclude_roles: nil,
      **_other_props
    )
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      pageviews = ImpactTracking::Pageview
        .where(created_at: start_date..end_date)

      if project_id.present?
        pageviews = pageviews.where(project_id: project_id)
      end

      if exclude_roles == 'exclude_admins_and_moderators'
        pageviews = pageviews
          .joins('LEFT JOIN impact_tracking_sessions ON impact_tracking_pageviews.session_id = impact_tracking_sessions.id')
          .where("impact_tracking_sessions.highest_role IS NULL OR impact_tracking_sessions.highest_role = 'user'")
      end

      # TODO

      {}
    end
  end
end
