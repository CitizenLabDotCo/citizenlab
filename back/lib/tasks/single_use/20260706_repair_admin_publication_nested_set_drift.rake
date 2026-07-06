# frozen_string_literal: true

# TAN-8089 — find and repair `lft`/`rgt` drift in the admin_publications nested
# set, which can cause orphaned publications (a Project/Folder whose
# admin_publication was cascade-deleted while the publication survived).
#
#   rake single_use:scan_admin_publication_drift    # read-only report, all tenants
#   rake single_use:repair_admin_publication_drift  # rebuild drifted tenants (guarded)
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
      orphan_projects, orphan_folders = integrity.orphan_counts
      valid = AdminPublication.left_and_rights_valid?
      next if pairs.zero? && orphan_projects.zero? && orphan_folders.zero? && valid

      flagged << { host: tenant.host, pairs: pairs, victims: victims,
                   orphan_projects: orphan_projects, orphan_folders: orphan_folders, valid: valid }
      puts "#{tenant.host.ljust(45)} drift_pairs=#{pairs} victims=#{victims} " \
           "orphan_projects=#{orphan_projects} orphan_folders=#{orphan_folders} valid=#{valid}"
    rescue StandardError => e
      puts "!! #{tenant.host}: #{e.class}: #{e.message}"
    end

    puts "\nFlagged #{flagged.size} tenant(s). " \
         "drift_pairs=#{flagged.sum { |t| t[:pairs] }} " \
         "orphan_projects=#{flagged.sum { |t| t[:orphan_projects] }} " \
         "orphan_folders=#{flagged.sum { |t| t[:orphan_folders] }}"
  end

  desc 'Rebuild admin_publications nested set for drifted tenants (safety-gated)'
  task repair_admin_publication_drift: :environment do
    integrity = AdminPublications::NestedSetIntegrity
    repaired = 0

    Tenant.safe_switch_each do |tenant|
      pairs, = integrity.drift_counts
      next if pairs.zero?

      orphans_before = integrity.orphan_counts.sum
      committed = false

      ActiveRecord::Base.transaction do
        integrity.rebuild_locked!
        after_pairs, = integrity.drift_counts
        orphans_after = integrity.orphan_counts.sum

        if after_pairs.zero? && AdminPublication.valid? && orphans_after == orphans_before
          committed = true # fall through -> commit
        else
          puts "#{tenant.host.ljust(45)} ROLLED BACK drift=#{after_pairs} " \
               "valid=#{AdminPublication.valid?} orphans #{orphans_before}->#{orphans_after}"
          raise ActiveRecord::Rollback
        end
      end

      if committed
        repaired += 1
        puts "#{tenant.host.ljust(45)} REPAIRED (was #{pairs} drift pair(s))"
      end
    rescue StandardError => e
      puts "!! #{tenant.host}: #{e.class}: #{e.message}"
    end

    puts "\nRepaired #{repaired} tenant(s)."
  end
end
