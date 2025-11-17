class VisitsService
  def phase_visits_data(phase)
    constraints = { project_id: phase.project.id }

    constraints[:created_at] = if phase.end_at.present?
      phase.start_at..phase.end_at
    else
      phase.start_at..
    end

    total_visitors = ImpactTracking::Session
      .joins(:pageviews)
      .where(impact_tracking_pageviews: constraints)
      .distinct
      .count("COALESCE(NULLIF(impact_tracking_sessions.user_id::text, ''), impact_tracking_sessions.monthly_user_hash)")

    recent_visitors = ImpactTracking::Session
      .joins(:pageviews)
      .where(impact_tracking_pageviews: constraints.merge(created_at: 7.days.ago..))
      .distinct
      .count("COALESCE(NULLIF(impact_tracking_sessions.user_id::text, ''), impact_tracking_sessions.monthly_user_hash)")

    {
      total: total_visitors,
      last_7_days: recent_visitors
    }
  end
end
