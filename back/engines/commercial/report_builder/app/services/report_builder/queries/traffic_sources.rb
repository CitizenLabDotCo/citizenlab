module ReportBuilder
  class Queries::TrafficSources < ReportBuilder::Queries::Base
    DIRECT_ENTRY_CASES = [
      "WHEN referrer IS NULL OR referrer = '' THEN 'direct_entry'"
    ]

    SEARCH_ENGINE_REFERRERS = ['android-app://com.google.android.googlequicksearchbox']
    SEARCH_ENGINE_DOMAINS = %w[
      google bing duckduckgo ecosia yahoo yandex msn qwant startpage
      search.brave search.yahoo cl.search.yahoo
    ].freeze

    SOCIAL_NETWORK_REFERRERS = ['android-app://com.linkedin.android']
    SOCIAL_NETWORK_DOMAINS = %w[
      facebook instagram linkedin snapchat reddit hoplr tiktok twitter x
      m.facebook l.facebook lm.facebook l.instagram out.reddit lnkd.in bsky
    ].freeze

    SSO_REFERRERS = %w[
      https://accounts.claveunica.gob.cl
      https://accounts.google.com
      https://login.microsoftonline.com
      https://my.esr.nhs.uk
      https://nemlog-in.mitid.dk
      https://frederikssund.criipto.id
      https://pvp.wien.gv.at
      https://app.franceconnect.gouv.fr
    ]

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

      cases = DIRECT_ENTRY_CASES
      cases += generate_cases(SEARCH_ENGINE_REFERRERS, SEARCH_ENGINE_DOMAINS, 'search_engine')
      cases += generate_cases(SOCIAL_NETWORK_REFERRERS, SOCIAL_NETWORK_DOMAINS, 'social_network')
      cases += generate_cases(SSO_REFERRERS, [], 'sso_redirect')

      sessions_per_referrer_type = sessions
        .select(
          'count(*) as count, ' \
          "CASE #{cases.join(' ')} ELSE 'other' END as referrer_type"
        )
        .group(:referrer_type)
        .each_with_object({}) do |row, obj|
          referrer_type = row['referrer_type']

          if referrer_type.present?
            count = row['count'].to_i
            obj[referrer_type] = count
          end
        end

      top_50_referrers = sessions

      SSO_REFERRERS.each do |sso_referrer|
        top_50_referrers = top_50_referrers.where.not("referrer IS NOT NULL AND starts_with(referrer, '#{sso_referrer}')")
      end

      top_50_referrers = top_50_referrers
        .select(
          'count(*) as visits, ' \
          'count(distinct(monthly_user_hash)) as visitors, ' \
          "CASE #{cases.join(' ')} ELSE 'other' END as referrer_type," \
          'referrer'
        )
        .group(:referrer)
        .order('visits DESC')
        .limit(50)
        .map do |row|
          referrer = row['referrer']
          visits = row['visits'].to_i
          visitors = row['visitors'].to_i
          referrer_type = row['referrer_type']

          {
            referrer: referrer,
            visits: visits,
            visitors: visitors,
            referrer_type: referrer_type
          }
        end

      {
        sessions_per_referrer_type: sessions_per_referrer_type,
        top_50_referrers: top_50_referrers
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

    def generate_cases(referrers, domains, type)
      domain_variants = referrers.dup

      domains.each do |domain|
        domain_variants += generate_domain_variants(domain)
      end

      domain_variants.map do |domain_variant|
        "WHEN starts_with(referrer, '#{domain_variant}') THEN '#{type}'"
      end
    end

    def generate_domain_variants(domain)
      [
        "https://#{domain}",
        "https://www.#{domain}",
        "http://#{domain}",
        "http://www.#{domain}"
      ]
    end
  end
end
