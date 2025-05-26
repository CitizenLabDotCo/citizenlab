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

      # We first remove the 'en' locale from the list of supported locales,
      # because we want to make sure it is the last case in the SQL query.
      # If it is not the last case, it will match other locales that start with 'en',
      # like 'en-US' or 'en-GB'.
      locales_without_en = CL2_SUPPORTED_LOCALES.reject { |locale| locale.to_s == 'en' }

      cases = locales_without_en.map do |locale|
        "WHEN starts_with(path, '/#{locale}') THEN '#{locale}'"
      end

      # We add the 'en' locale manually as the last case in the SQL query.
      cases << "WHEN starts_with(path, '/en') THEN 'en'"

      locales = pageviews
        .select(
          'count(distinct session_id) as count, ' \
          "CASE #{cases.join(' ')} ELSE NULL END as locale"
        )
        .group(:locale)

      {
        sessions_per_locale: locales.each_with_object({}) do |row, obj|
          locale = row['locale']

          if locale.present?
            count = row['count'].to_i
            obj[locale] = count
          end
        end
      }
    end
  end
end
