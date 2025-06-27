module ReportBuilder
  class Queries::VisitorsLanguages < ReportBuilder::Queries::Base
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
        pageviews = pageviews.joins(:session).where(impact_tracking_sessions: { highest_role: ['user', nil] })
      end

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
