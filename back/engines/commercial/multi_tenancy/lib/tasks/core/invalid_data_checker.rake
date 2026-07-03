# frozen_string_literal: true

namespace :checks do
  desc 'Check if there are any invalid instances and print a report'
  task invalid_data: :environment do
    checker = InvalidDataChecker.new
    summary = checker.check_global
    active_tenants = Tenant.select do |tenant|
      tenant.configuration.active? || tenant.host.ends_with?(ENV.fetch('TEMPLATE_URL_SUFFIX', '.localhost'))
    end
    active_tenants.each do |tenant|
      puts "Processing #{tenant.host}..."
      summary = checker.check_tenant tenant: tenant, summary: summary
    end

    # Forward any admin_publication orphaning events captured by the DB trigger
    # (see AdminPublicationDeletionAudit) to Sentry. Reuses this weekly, per-region
    # schedule rather than a dedicated one; idempotent via `reported_at`.
    ReportOrphanedAdminPublicationsJob.perform_now

    if summary[:issues].present?
      puts JSON.pretty_generate summary
      raise 'Some data is invalid.'
    else
      puts 'Success!'
    end
  end
end
