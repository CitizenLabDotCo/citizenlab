module Insights
  class VisitsService
    def phase_visits(phase)
      constraints = { project_id: phase.project.id }

      constraints[:created_at] = if phase.end_at.present?
        phase.start_at.beginning_of_day..phase.end_at.end_of_day
      else
        phase.start_at.beginning_of_day..
      end

      visits = ImpactTracking::Session
        .joins(:pageviews)
        .where(impact_tracking_pageviews: constraints)

      visits.select(
        "impact_tracking_pageviews.created_at AS date,
        impact_tracking_sessions.user_id AS user_id,
        impact_tracking_sessions.monthly_user_hash AS monthly_user_hash"
      ).map do |row|
        {
          acted_at: row.date,
          visitor_id: row.user_id.present? ? row.user_id.to_s : row.monthly_user_hash
        }
      end
    end
  end
end
