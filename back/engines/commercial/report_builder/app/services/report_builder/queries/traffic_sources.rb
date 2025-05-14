module ReportBuilder
  class Queries::TrafficSources < ReportBuilder::Queries::Base
    SEARCH_ENGINE_REFERRERS = ['android-app://com.google.android.googlequicksearchbox/']
    SEARCH_ENGINE_DOMAINS = %w[
      google bing duckduckgo ecosia yahoo yandex msn qwant startpage
      search.brave search.yahoo cl.search.yahoo
    ].freeze

    def run_query(
      start_at: nil,
      end_at: nil,
      project_id: nil,
      exclude_roles: nil,
      **_other_props
    )
      start_date, end_date = TimeBoundariesParser.new(start_at, end_at).parse

      sessions = ImpactTracking::Session.where(created_at: start_date..end_date)
      sessions = apply_project_filter_if_needed(sessions, project_id)
      sessions = exclude_roles_if_needed(sessions, exclude_roles)

      cases = search_engine_cases

      referrer_types = sessions
        .select(
          "count(*) as count, " \
          "CASE #{cases.join(' ')} ELSE NULL END as referrer_type"
        )
        .group(:referrer_type)

      {
        sessions_per_referrer_type: referrer_types.each_with_object({}) do |row, obj|
          referrer_type = row['referrer_type']

          if referrer_type.present?
            count = row['count'].to_i
            obj[referrer_type] = count
          end
        end
      }
    end

    def apply_project_filter_if_needed(sessions, project_id)
      if project_id.present?
        sessions_with_project = ImpactTracking::Pageview.where(project_id: project_id).select(:session_id)
        sessions = sessions.where(id: sessions_with_project)
      end

      sessions
    end

    def exclude_roles_if_needed(sessions, exclude_roles)
      if exclude_roles == 'exclude_admins_and_moderators'
        sessions = sessions
          .where("highest_role IS NULL OR highest_role = 'user'")
      end

      sessions
    end

    def search_engine_cases
      domain_variants = SEARCH_ENGINE_REFERRERS.dup

      SEARCH_ENGINE_DOMAINS.each do |domain|
        domain_variants += generate_domain_variants(domain)
      end

      domain_variants.map do |domain_variant|
        "WHEN starts_with(referrer, '#{domain_variant}') THEN 'search_engine'"
      end
    end

    def generate_domain_variants(domain)
      [
        "https://#{domain}",
        "https://www.#{domain}",
        "http://#{domain}",
        "http://www.#{domain}",
      ]
    end
  end
end
