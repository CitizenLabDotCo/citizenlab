module Insights
  class VisitsService
    def phase_visits_data(phase)
      constraints = { project_id: phase.project.id }

      constraints[:created_at] = if phase.end_at.present?
        phase.start_at..phase.end_at
      else
        phase.start_at..
      end

      visits = ImpactTracking::Session
        .joins(:pageviews)
        .where(impact_tracking_pageviews: constraints)

      visits_list = visits.select(
        "impact_tracking_pageviews.created_at AS date,
        impact_tracking_sessions.user_id AS user_id,
        impact_tracking_sessions.monthly_user_hash AS monthly_user_hash"
      ).map do |row|
        {
          date: row.date,
          visitor_id: row.user_id.present? ? row.user_id.to_s : row.monthly_user_hash
        }
      end

      visitors_total = visits_list.pluck(:visitor_id).compact.uniq.count
      last_7_days_start = 7.days.ago
      last_7_days_end = phase.end_at.present? ? [Time.current, phase.end_at].min : Time.current

      visitors_last_7_days = visits_list
        .select { |v| v[:date] >= last_7_days_start && v[:date] <= last_7_days_end }
        .pluck(:visitor_id)
        .compact
        .uniq
        .count

      {
        visitors_total: visitors_total || 0,
        visitors_last_7_days: visitors_last_7_days || 0,
        visits: visits_list
      }
    end
  end
end
