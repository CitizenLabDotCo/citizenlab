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
    poll_timeout = ENV.fetch('POLL_TIMEOUT', '120').to_i

    # Without a TTY `$stdin.gets` returns nil, which would silently skip every tenant and look
    # exactly like a successful run. This task destroys schemas; it must not guess.
    if !report_only && !$stdin.tty?
      abort 'This task destroys tenants and must be confirmed interactively. ' \
            'Run it from a terminal, or use REPORT_ONLY=true for a non-interactive report.'
    end

    reporter = ScriptReporter.new
    tenants = host ? Tenant.deleted.where(host: host) : Tenant.deleted

    Rails.logger.info "Found #{tenants.count} tenant(s) with an unfinished deletion."

    tenants.each do |tenant|
      reporter.add_processed_tenant(tenant)

      stats = tenant.switch do
        {
          users: User.count,
          admins: User.admin.count,
          draft_baskets: Basket.not_submitted.count,
          drifted_phases: Phase.where.not(presentation_mode: nil)
            .where.not('presentation_mode = ANY(available_views)').count,
          orphaned_projects: Project.where.missing(:admin_publication).count
        }
      end

      jobs = QueJob.by_job_class(DeleteUserJob).all_by_tenant_schema_name(tenant.schema_name)
      pending_jobs = jobs.not_finished.not_expired.count
      failure_classes = jobs.expired.pluck(:last_error_message).map { |m| m.to_s.split(': ').first }.tally

      Rails.logger.info "\n#{'=' * 80}"
      Rails.logger.info "#{tenant.host}  (deleted_at #{tenant.deleted_at}, #{(Time.zone.today - tenant.deleted_at.to_date).to_i} days ago)"
      Rails.logger.info "  users: #{stats[:users]} (admins: #{stats[:admins]})"
      Rails.logger.info "  draft baskets: #{stats[:draft_baskets]}"
      Rails.logger.info "  drifted phases: #{stats[:drifted_phases]}   orphaned projects: #{stats[:orphaned_projects]}"
      Rails.logger.info "  DeleteUserJobs: #{pending_jobs} pending, #{jobs.expired.count} expired"
      failure_classes.each { |klass, count| Rails.logger.info "    #{count} x #{klass}" }
      Rails.logger.info '  ⚠️  drifted phases remain — run single_use:fix_phase_available_views first' if stats[:drifted_phases].positive?
      Rails.logger.info '  ℹ️  a DeleteUserJob is still pending — this deletion may not be stuck' if pending_jobs.positive?

      next if report_only

      print "  Type the host to finish this deletion, 's' to skip, 'q' to quit: "
      answer = $stdin.gets&.strip

      break if answer.nil? || answer == 'q'

      if answer != tenant.host
        Rails.logger.info '  Skipped.'
        next
      end

      tenant_host = tenant.host
      tenant.switch { User.destroy_all_async }

      deadline = Time.zone.now + poll_timeout.seconds
      remaining = tenant.switch { User.count }
      while remaining.positive? && Time.zone.now < deadline
        sleep 2
        remaining = tenant.switch { User.count }
      end

      if remaining.positive?
        latest_error = jobs.expired.order(:expired_at).last&.last_error_message
        reporter.add_error(
          "#{remaining} user(s) could not be deleted. Latest job error: #{latest_error}",
          context: { tenant: tenant_host }
        )
        Rails.logger.info "  ❌ #{remaining} user(s) remain; tenant not destroyed."
        next
      end

      MultiTenancy::Tenants::DeleteJob.perform_now(tenant)
      reporter.add_delete('Tenant', tenant.id, context: { host: tenant_host })
      Rails.logger.info "  ✅ #{tenant_host} destroyed."
    rescue StandardError => e
      reporter.add_error("#{e.class}: #{e.message}", context: { tenant: tenant.host })
      Rails.logger.error "  ❌ #{tenant.host}: #{e.class}: #{e.message}"
    end

    # Skipped tenants are those in `processed_tenants` that appear in neither `deletes` nor `errors`.
    reporter.report!(report_only ? 'finish_stuck_tenant_deletions_report.json' : 'finish_stuck_tenant_deletions.json')
  end
end
