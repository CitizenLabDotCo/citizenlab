# frozen_string_literal: true

# Delete the cl2-tenant-monitor's impact-tracking rows (TAN-8859).
#
# From 2 Sep 2026 until it was switched off around 6-7 Oct 2026, our uptime
# monitor loaded every platform's homepage with headless Chrome every 15 minutes.
# It sent a custom User-Agent (USER_AGENT=GoVocalTenantMonitor/1.0) that CrawlerDetect
# does not recognise as a bot, so `ignore_crawlers` did not filter it; the `browser`
# gem couldn't classify it either, so every row was stored with browser_name=
# "Unknown Browser" / os_name="Unknown". Each check created one anonymous
# ImpactTracking::Session plus one homepage pageview (~96/day, ~2,700-2,900 a month
# per platform). Its IP and UA never change, so all its sessions for a tenant in a
# month collapse to one `monthly_user_hash` — visits spike, visitors don't.
#
# Identification (no IP/UA is stored; monthly salts rotate and old ones are gone,
# so historical hashes can't be recomputed): per tenant, an anonymous
# `monthly_user_hash` (user_id IS NULL) with at least MIN_SESSIONS sessions in the
# window whose pageviews are all homepage ("/", or a locale root like "/en/") — the
# monitor only ever loaded homepages. For the CURRENT month only, the task also
# recomputes the expected hash from the known IP + UA and the live salt and flags
# the match as confirmation.
#
# Because that UA is unclassifiable, the `browser` gem stored browser_name=
# "Unknown Browser" / os_name="Unknown" for every monitor row, so a candidate hash is
# additionally required to be Unknown/Unknown throughout before it is matched.
#
# Follow-up NOT done here (see TAN-8859): republish phase reports whose traffic
# widgets cover Sep-Oct 2026 (ReportBuilder::ReportPublisher#publish) — their
# stored snapshots in report_builder_published_graph_data_units do not self-correct.
# Every live dashboard/report reads the tables directly, so they fix retroactively.
#
# Runs over currently-active tenants only (the monitor only hit live platforms; churned ones
# are ignored), unless narrowed to a single host.
#   rake single_use:delete_uptime_monitor_sessions                      # dry run, active tenants
#   rake 'single_use:delete_uptime_monitor_sessions[execute]'           # delete, active tenants
#   rake 'single_use:delete_uptime_monitor_sessions[execute,foo.com]'   # delete, one tenant
#
# Fingerprint on samenhattem.nl first (the ticket's reproduction platform):
#   rake 'single_use:delete_uptime_monitor_sessions[,samenhattem.nl]'
#
# ENV overrides: START, END (window), MIN_SESSIONS (default 50), MONITOR_IP
# (comma-separate several sources), MONITOR_UA (current-month confirmation).
namespace :single_use do
  desc "Delete the uptime-monitor bot's impact-tracking sessions (Sep-Oct 2026). Dry run unless 'execute'."
  task :delete_uptime_monitor_sessions, %i[execute host] => [:environment] do |_t, args|
    # "/", "/en", "/en/", "/fr-BE/", ... — root, optionally with a locale segment.
    home_re      = '^/([a-z]{2}(-[A-Z]{2})?)?/?$'
    min_sessions = Integer(ENV.fetch('MIN_SESSIONS', '50'))
    start_t      = Time.zone.parse(ENV.fetch('START', '2026-09-02'))
    end_t        = Time.zone.parse(ENV.fetch('END', '2026-10-08'))
    # Comma-separate to confirm several sources this month, e.g. the prod box plus a
    # laptop that also ran the monitor locally: MONITOR_IP=178.104.167.28,81.174.153.142
    monitor_ips  = ENV.fetch('MONITOR_IP', '178.104.167.28').split(',').map(&:strip).reject(&:empty?)
    # The monitor ran with USER_AGENT=GoVocalTenantMonitor/1.0 (prod box and locally).
    monitor_ua   = ENV.fetch('MONITOR_UA', 'GoVocalTenantMonitor/1.0')

    totals = { tenants: 0, sessions: 0, pageviews: 0, with_project_id: 0 }

    # Median seconds between consecutive sessions — a near-constant gap is the monitor's 15-min cadence.
    median_gap = lambda do |times|
      return nil if times.size < 3

      gaps = times.each_cons(2).map { |a, b| (b - a).to_i }.sort
      mid = gaps.size / 2
      gaps.size.odd? ? gaps[mid] : ((gaps[mid - 1] + gaps[mid]) / 2)
    end

    # Echo the effective config up front, so every run shows exactly what it used.
    # If these don't reflect your ENV overrides, Spring swallowed them — prefix the
    # command with DISABLE_SPRING=1 (or run `spring stop` first) and re-run.
    # rubocop:disable Rails/Output
    puts "   Window:       #{start_t.to_date}..#{end_t.to_date}"
    puts "   MIN_SESSIONS: #{min_sessions}"
    puts "   MONITOR_IP:   #{monitor_ips.join(', ')}"
    # rubocop:enable Rails/Output

    TenantScript.run(
      'delete_uptime_monitor_sessions',
      args: args,
      # The monitor only ever hit live platforms, and we don't care about any that have since
      # churned — so skip everything but currently-active tenants (never switched into either).
      tenants: Tenant.creation_finalized.with_lifecycle('active'),
      description: "deleting uptime-monitor sessions #{start_t.to_date}..#{end_t.to_date}",
      summary: lambda { |script|
        # rubocop:disable Rails/Output
        verb = script.execute? ? 'Deleted' : 'To delete (dry run)'
        puts "   Tenants with monitor rows: #{totals[:tenants]}"
        puts "   #{verb}: #{totals[:sessions]} sessions, #{totals[:pageviews]} pageviews"
        if totals[:with_project_id].positive?
          puts "   WARNING: #{totals[:with_project_id]} matched pageviews carry a project_id (expected 0 — review before deleting)"
        end
        # rubocop:enable Rails/Output
      }
    ) do |tenant, script|
      anon = ImpactTracking::Session.where(user_id: nil, created_at: start_t...end_t)

      # Candidate hashes: anonymous, at least MIN_SESSIONS rows in the window.
      candidates = anon.group(:monthly_user_hash).having('COUNT(*) >= ?', min_sessions).count
      next if candidates.empty?

      # Current-month confirmation: recompute the monitor's hash from the live salt
      # (read raw, no rotation). Matches only this month's rows; Sep salt is gone.
      salt_row = ImpactTracking::Salt.order(:created_at).last
      expected_hashes = salt_row ? monitor_ips.map { |ip| Digest::SHA256.hexdigest("#{salt_row.salt}#{ip}#{monitor_ua}") } : []

      matched_ids = []
      tenant_sessions = 0
      tenant_pageviews = 0

      candidates.each do |hash, count|
        ids = anon.where(monthly_user_hash: hash).pluck(:id)
        pvs = ImpactTracking::Pageview.where(session_id: ids)

        # Reject the hash if any of its pageviews is NOT a homepage — the monitor only loaded homepages.
        next if pvs.exists?(['path !~ ?', home_re])

        # The monitor's custom UA is unclassifiable, so every monitor row is stored as
        # browser_name="Unknown Browser" / os_name="Unknown"; require that throughout.
        combos = anon.where(monthly_user_hash: hash).distinct.pluck(:browser_name, :os_name)
        next unless combos.all? { |b, o| b.to_s.include?('Unknown') && o.to_s.include?('Unknown') }

        pv_count = pvs.count
        with_pid = pvs.where.not(project_id: nil).count
        browser, os = anon.where(monthly_user_hash: hash).distinct.pick(:browser_name, :os_name)
        times = anon.where(monthly_user_hash: hash).order(:created_at).pluck(:created_at)

        matched_ids.concat(ids)
        tenant_sessions += count
        tenant_pageviews += pv_count
        totals[:with_project_id] += with_pid

        script.reporter.add_delete(
          'ImpactTracking::Session',
          "#{count} sessions + #{pv_count} pageviews",
          context: {
            tenant: tenant.host,
            hash: "#{hash[0, 8]}…",
            browser: browser,
            os: os,
            median_gap_s: median_gap.call(times),
            span: "#{times.first&.strftime('%Y-%m-%d')}..#{times.last&.strftime('%Y-%m-%d')}",
            ip_confirmed_this_month: expected_hashes.include?(hash),
            pageviews_with_project_id: with_pid
          }
        )
      end

      next if matched_ids.empty?

      totals[:tenants] += 1
      totals[:sessions] += tenant_sessions
      totals[:pageviews] += tenant_pageviews

      next unless script.execute?

      # FK order: pageviews before sessions. Batched delete_all (dependent: :destroy is too slow).
      matched_ids.each_slice(5000) do |slice|
        ImpactTracking::Pageview.where(session_id: slice).delete_all
        ImpactTracking::Session.where(id: slice).delete_all
      end
    end
  end
end
