module ReportBuilder
  class Queries::Visitors < ReportBuilder::Queries::Base
    def run_query(
      start_at, 
      end_at,
      resolution: nil,
      project_id = nil,
      compare_start_at: nil,
      compare_end_at: nil,
      **_other_props
    )
      # Time series
      # TODO

      # Total number of visits and visitors
      sessions = ImpactTracking::Session.where(created_at: start_at..end_at)
      visits_total = sessions.count
      visitors_total = sessions.distinct.pluck(:monthly_user_hash).count

      # Duration and pages visited (matomo)
      # TODO

      # If compare_start_at and compare_end_at are present:
      if compare_start_at.present? && compare_end_at.present?
        # TODO
      end
    end
  end
end
