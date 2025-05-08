module ReportBuilder
  class Queries::VisitorLanguages < ReportBuilder::Queries::Base
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

      # TODO exclude_roles

      cases = CL2_SUPPORTED_LOCALES.map do |locale|
        "WHEN starts_with(path, '/#{locale}') THEN '#{locale}'"    
      end

      locales = pageviews
        .select(
          :session_id,
          "CASE #{cases.join(' ')} ELSE NULL END AS locale"
        )
        .where('locale IS NOT NULL')
        .group(:session_id, :locale)

      binding.pry
    end
  end
end
