# frozen_string_literal: true

# Finishes tenant deletions that stalled.
#
# `TenantService#delete` sets `deleted_at`, sweeps the users asynchronously, and lets
# `Tenants::DeleteJob` destroy the tenant once no users remain. When a `DeleteUserJob` fails
# permanently the user count stops decreasing, `Tenants::DeleteJob` raises `Aborted`, and the
# tenant is left with `deleted_at` set, its users intact and no job that will ever retry. A
# surviving `Tenant` row with `deleted_at` set is exactly that state, because a completed
# deletion destroys the row.
#
# Nothing resumes those deletions on its own, so this task does it, one tenant at a time, with
# the evidence needed to decide printed before each prompt.
#
# It deliberately does not call `TenantService#delete` again: that would overwrite `deleted_at`
# (losing the record of when the deletion was actually requested) and re-run `before_destroy`,
# which deletes Typeform webhooks that are already gone.
#
# REPORT_ONLY=true prints the report and asks nothing. HOST=<host> limits it to one tenant.
namespace :single_use do
  desc 'Finish tenant deletions that stalled. Interactive. REPORT_ONLY=true to only report.'
  task finish_stuck_tenant_deletions: :environment do
    report_only = ENV['REPORT_ONLY']&.downcase == 'true'
    host = ENV.fetch('HOST', nil)
    poll_timeout_override = ENV['POLL_TIMEOUT']&.to_i

    # Without a TTY `$stdin.gets` returns nil, which would silently skip every tenant and look
    # exactly like a successful run. This task destroys schemas; it must not guess.
    if !report_only && !$stdin.tty?
      abort 'This task destroys tenants and must be confirmed interactively. ' \
            'Run it from a terminal, or use REPORT_ONLY=true for a non-interactive report.'
    end

    reporter = ScriptReporter.new
    tenants = host ? Tenant.deleted.where(host: host) : Tenant.deleted

    if tenants.none?
      puts 'No unfinished tenant deletions on this cluster. Nothing to do.'
      next
    end

    puts "Found #{tenants.count} tenant(s) with an unfinished deletion."

    tenants.each do |tenant|
      reporter.add_processed_tenant(tenant)

      stats = tenant.switch do
        # A tenant deleted before the 20260223103753 migration never received the column
        # (Apartment migrates `Tenant.not_deleted` only). That must not stop us finishing its
        # deletion, so the statistic is reported as unknown rather than raising.
        drifted_phases =
          if ActiveRecord::Base.connection.column_exists?(:phases, :available_views)
            Phase.where.not(presentation_mode: nil)
              .where.not('presentation_mode = ANY(available_views)').count
          end

        {
          users: User.count,
          admins: User.admin.count,
          draft_baskets: Basket.not_submitted.count,
          drifted_phases: drifted_phases,
          orphaned_projects: Project.where.missing(:admin_publication).count
        }
      end

      user_jobs = QueJob.by_job_class(DeleteUserJob).all_by_tenant_schema_name(tenant.schema_name)
      pending_user_jobs = user_jobs.not_finished.not_expired.count
      failure_classes = user_jobs.expired.pluck(:last_error_message).map { |m| m.to_s.split(': ').first }.tally

      # `Tenants::DeleteJob` is enqueued outside the tenant switch, so it is not found by schema
      # name; it references the tenant through its global id in the job arguments.
      pending_tenant_jobs = QueJob.by_job_class(MultiTenancy::Tenants::DeleteJob)
        .not_finished.not_expired
        .where('args::text LIKE ?', "%#{tenant.id}%")
        .count

      drifted = stats[:drifted_phases] || 'unknown (schema predates the available_views migration)'

      puts "\n#{'=' * 80}"
      puts "#{tenant.host}  (deleted_at #{tenant.deleted_at}, #{(Time.zone.today - tenant.deleted_at.to_date).to_i} days ago)"
      puts "  users: #{stats[:users]} (admins: #{stats[:admins]})"
      puts "  draft baskets: #{stats[:draft_baskets]}"
      puts "  drifted phases: #{drifted}   orphaned projects: #{stats[:orphaned_projects]}"
      puts "  DeleteUserJobs: #{pending_user_jobs} pending, #{user_jobs.expired.count} expired"
      failure_classes.each { |klass, count| puts "    #{count} x #{klass}" }
      puts '  ⚠️  drifted phases remain — run single_use:fix_phase_available_views first' if stats[:drifted_phases].to_i.positive?

      next if report_only

      # A deletion with jobs still in flight is in progress, not stuck. Sweeping again would
      # enqueue a second DeleteUserJob per user; because `pluck(:id)` has no ORDER BY, both
      # sweeps walk the table in the same order and the later one fails on every user.
      if pending_user_jobs.positive? || pending_tenant_jobs.positive?
        puts '  ⏭️  Skipped: this deletion is still in progress (jobs pending). Sweeping again would duplicate them.'
        next
      end

      print "  Type the host to finish this deletion, 's' to skip, 'q' to quit: "
      $stdout.flush
      answer = $stdin.gets&.strip

      break if answer.nil? || answer == 'q'

      if answer != tenant.host
        puts '  Skipped.'
        next
      end

      tenant_host = tenant.host
      tenant.switch { User.destroy_all_async }

      # The sweep fans out at 5 jobs/sec, so the last job runs about `users / 5` seconds after it
      # starts. A fixed timeout would report a large tenant as failed while it is still working.
      poll_timeout = poll_timeout_override || [(stats[:users] / 5.0).ceil + 60, 120].max
      deadline = Time.zone.now + poll_timeout.seconds
      remaining = tenant.switch { User.count }
      while remaining.positive? && Time.zone.now < deadline
        sleep 2
        remaining = tenant.switch { User.count }
      end

      if remaining.positive?
        still_pending = user_jobs.not_finished.not_expired.count

        if still_pending.positive?
          puts "  ⏳ Sweep still in progress: #{remaining} user(s) left, #{still_pending} job(s) queued. Re-run later."
          reporter.add_error(
            "sweep still in progress after #{poll_timeout}s: #{remaining} user(s) remain, #{still_pending} job(s) queued",
            context: { tenant: tenant_host }
          )
        else
          # The *errored* jobs carry this attempt's failure. The *expired* ones carry the failure
          # of a previous attempt, which may be months old.
          latest_error = user_jobs.errored.order(error_count: :desc).first&.last_error_message
          puts "  ❌ #{remaining} user(s) remain; tenant not destroyed."
          puts "     Latest job error: #{latest_error}"
          reporter.add_error(
            "#{remaining} user(s) could not be deleted. Latest job error: #{latest_error}",
            context: { tenant: tenant_host }
          )
        end
        next
      end

      MultiTenancy::Tenants::DeleteJob.perform_now(tenant)
      reporter.add_delete('Tenant', tenant.id, context: { host: tenant_host })
      puts "  ✅ #{tenant_host} destroyed."
    rescue StandardError => e
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
      puts "  ❌ #{tenant.host}: #{e.class}: #{e.message}"
    end

    # Skipped tenants are those in `processed_tenants` that appear in neither `deletes` nor `errors`.
    reporter.report!(report_only ? 'finish_stuck_tenant_deletions_report.json' : 'finish_stuck_tenant_deletions.json')
  end
end
