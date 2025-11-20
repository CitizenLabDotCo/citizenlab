class VisitsService
  def phase_visitors_data(phase)
    constraints = { project_id: phase.project.id }

    constraints[:created_at] = if phase.end_at.present?
      phase.start_at..phase.end_at
    else
      phase.start_at..
    end

    visitors_total = ImpactTracking::Session
      .joins(:pageviews)
      .where(impact_tracking_pageviews: constraints)
      .distinct
      .count("COALESCE(NULLIF(impact_tracking_sessions.user_id::text, ''), impact_tracking_sessions.monthly_user_hash)")

    # Calculate last 7 days range, but cap it at phase end date
    last_7_days_start = 7.days.ago
    last_7_days_end = phase.end_at.present? ? [Time.current, phase.end_at].min : Time.current
    last_7_days_range = last_7_days_start..last_7_days_end

    visitors_last_7_days = ImpactTracking::Session
      .joins(:pageviews)
      .where(impact_tracking_pageviews: constraints.merge(created_at: last_7_days_range))
      .distinct
      .count("COALESCE(NULLIF(impact_tracking_sessions.user_id::text, ''), impact_tracking_sessions.monthly_user_hash)")

    {
      total: visitors_total,
      last_7_days: visitors_last_7_days
    }
  end
end
