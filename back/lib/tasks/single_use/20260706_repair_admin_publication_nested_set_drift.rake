# frozen_string_literal: true

# TAN-8089 — find and repair `lft`/`rgt` drift in the admin_publications nested
# set, which can cause orphaned publications (a Project/Folder whose
# admin_publication was cascade-deleted while the publication survived).
#
# Example commands (run from the repo root):
#   Report only (read-only, all tenants):
#     docker compose run --rm web bundle exec rake single_use:scan_admin_publication_drift
#
#   Dry run (rebuilds in a transaction and reports what WOULD change, then rolls back):
#     docker compose run --rm web bundle exec rake single_use:repair_admin_publication_drift
#
#   Execute (applies the rebuild for drifted tenants that pass the safety gate):
#     docker compose run --rm web bundle exec rake single_use:repair_admin_publication_drift[execute]
#
# One-off production remediation. The reusable detection/repair logic lives in
# AdminPublications::NestedSetIntegrity, which also backs the permanent destroy
# guard on AdminPublication.
namespace :single_use do
  desc 'Report admin_publications nested-set drift and existing orphans per tenant'
  task scan_admin_publication_drift: :environment do
    integrity = AdminPublications::NestedSetIntegrity
    flagged = []

    Tenant.safe_switch_each do |tenant|
      pairs, victims = integrity.drift_counts
      orphaned = { 'Project' => integrity.orphaned_projects.pluck(:id, :created_at, :updated_at),
                   'ProjectFolders::Folder' => integrity.orphaned_folders.pluck(:id, :created_at, :updated_at) }
      orphan_projects = orphaned['Project'].size
      orphan_folders = orphaned['ProjectFolders::Folder'].size
      valid = AdminPublication.left_and_rights_valid?
      next if pairs.zero? && orphan_projects.zero? && orphan_folders.zero? && valid

      flagged << { host: tenant.host, pairs: pairs, victims: victims,
                   orphan_projects: orphan_projects, orphan_folders: orphan_folders, valid: valid }
      puts "#{tenant.host.ljust(45)} drift_pairs=#{pairs} victims=#{victims} " \
           "orphan_projects=#{orphan_projects} orphan_folders=#{orphan_folders} valid=#{valid}"

      orphaned.each do |type, rows|
        rows.each do |id, created_at, updated_at|
          puts "    orphaned #{type} #{id} created_at=#{created_at.iso8601} updated_at=#{updated_at.iso8601}"
        end
      end
    rescue StandardError => e
      puts "!! #{tenant.host}: #{e.class}: #{e.message}"
    end

    puts "\nFlagged #{flagged.size} tenant(s). " \
         "drift_pairs=#{flagged.sum { |t| t[:pairs] }} " \
         "orphan_projects=#{flagged.sum { |t| t[:orphan_projects] }} " \
         "orphan_folders=#{flagged.sum { |t| t[:orphan_folders] }}"
  end

  desc 'Rebuild admin_publications nested set for drifted tenants (dry run unless [execute], safety-gated)'
  task :repair_admin_publication_drift, %i[execute] => [:environment] do |_t, args|
    execute = args[:execute] == 'execute'
    integrity = AdminPublications::NestedSetIntegrity
    reporter = ScriptReporter.new

    puts "---------- STARTING TASK: Repair admin_publications nested-set drift ----------\n\n"
    puts "Mode: #{execute ? 'EXECUTE - changes WILL be applied' : 'Dry run - no changes will be applied'}\n\n"

    repaired = 0

    Tenant.safe_switch_each do |tenant|
      pairs_before, victims_before = integrity.drift_counts
      next if pairs_before.zero?

      reporter.add_processed_tenant(tenant)
      orphans_before = integrity.orphan_counts
      base_context = { tenant: tenant.host, drift_pairs: pairs_before, victims: victims_before,
                       orphans_before: orphans_before }

      ActiveRecord::Base.transaction do
        integrity.rebuild_locked!
        pairs_after, = integrity.drift_counts
        valid_after = AdminPublication.valid?
        orphans_after = integrity.orphan_counts
        gate_ok = pairs_after.zero? && valid_after && orphans_after == orphans_before

        context = base_context.merge(drift_pairs_after: pairs_after, valid_after: valid_after,
          orphans_after: orphans_after, applied: execute && gate_ok)

        unless gate_ok
          reporter.add_error('Safety gate failed after rebuild; rolled back', context: context)
          puts "#{tenant.host.ljust(45)} ROLLED BACK (gate failed): drift #{pairs_before}->#{pairs_after} " \
               "valid=#{valid_after} orphans #{orphans_before}->#{orphans_after}"
          raise ActiveRecord::Rollback
        end

        reporter.add_change("drift_pairs=#{pairs_before}", "drift_pairs=#{pairs_after}", context: context)
        repaired += 1

        if execute
          puts "#{tenant.host.ljust(45)} REPAIRED: drift #{pairs_before}->0"
        else
          puts "#{tenant.host.ljust(45)} WOULD REPAIR: drift #{pairs_before}->0 (dry run)"
          raise ActiveRecord::Rollback # never persist in dry run
        end
      end
    rescue StandardError => e
      reporter.add_error(e.message, context: { tenant: tenant.host })
      puts "!! #{tenant.host}: #{e.class}: #{e.message}"
    end

    report_file = 'repair_admin_publication_drift.json'
    reporter.report!(report_file, verbose: false)
    puts "\n#{execute ? 'Repaired' : 'Would repair'} #{repaired} tenant(s). Report written to #{report_file}"
    puts "\n---------- FINISHED TASK: Repair admin_publications nested-set drift ----------\n\n"
  end
end
