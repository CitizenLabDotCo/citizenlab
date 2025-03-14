module ReportBuilder
  class Queries::Visitors < ReportBuilder::Queries::Base
    def run_query(
      start_at, 
      end_at,
      resolution: 'month',
      project_id: nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      sessions = ImpactTracking::Session.where(created_at: start_at..end_at)

      time_series = sessions
        .select(
          "count(*) as visits, count(distinct(monthly_user_hash)) as visitors, date_trunc('#{resolution}', created_at) as date_group"
        )
        .group("date_group")
        .order("date_group")
        .map do |row|
          {
            visits: row.visits,
            visitors: row.visitors,
            date_group: row.date_group.to_date
          }
        end

      # Total number of visits and visitors
      visits_total = sessions.count
      visitors_total = sessions.distinct.pluck(:monthly_user_hash).count

      # Duration and pages visited (matomo)
      # TODO

      # If compare_start_at and compare_end_at are present:
      if compare_start_at.present? && compare_end_at.present?
        # TODO
      end

      {
        time_series: time_series,
        visits_total: visits_total,
        visitors_total: visitors_total
      }
    end
  end
end
