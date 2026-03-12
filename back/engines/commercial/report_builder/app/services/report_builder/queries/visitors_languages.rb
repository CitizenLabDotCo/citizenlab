module ReportBuilder
  class Queries::VisitorsLanguages < ReportBuilder::Queries::Base
    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      exclude_roles: nil,
      **_other_props
    )
      visits_service = Insights::VisitsService.new(project_id, start_at:, end_at:, exclude_roles:)
      pageviews = visits_service.filtered_page_views

      locale_sql = Arel.sql("split_part(path, '/', 2)")

      session_locales = pageviews
        .distinct.select(:session_id, locale_sql.as('locale'))
        .where(locale_sql.in(CL2_SUPPORTED_LOCALES))

      sessions_per_locale = ImpactTracking::Session
        .with(session_locales: session_locales)
        .from('session_locales')
        .group(:locale)
        .count

      { sessions_per_locale: }
    end
  end
end
