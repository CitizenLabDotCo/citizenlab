# frozen_string_literal: true

require_relative 'services/description_to_content_builder_migration_service'

# Moves every project/folder description onto the Content Builder.
# DRY_RUN=true analyses without writing; HOST=<host> limits to one tenant.
namespace :single_use do
  desc 'Migrate WYSIWYG project/folder descriptions into a Content Builder bridge widget. DRY_RUN=true to analyse only.'
  task migrate_descriptions_to_content_builder: :environment do
    dry_run = ENV['DRY_RUN']&.downcase == 'true'
    host = ENV.fetch('HOST', nil)
    persist = !dry_run

    if dry_run
      Rails.logger.info '🔍 DRY RUN MODE: analysing description migration without writing.'
      Rails.logger.info '⚠️  NO DATABASE WRITES WILL BE PERFORMED'
    else
      Rails.logger.info '🚀 MIGRATION MODE: migrating descriptions to the Content Builder.'
      Rails.logger.info '⚠️  THIS WILL MODIFY THE DATABASE'
    end
    Rails.logger.info '=' * 80

    tenants = host ? Tenant.where(host: host) : Tenant.prioritize(Tenant.creation_finalized)
    totals = Hash.new(0)
    reporter = ScriptReporter.new

    tenants.each do |tenant|
      Rails.logger.info "\n🏢 Processing tenant: #{tenant.host}"
      reporter.add_processed_tenant(tenant)
      stats = nil
      tenant.switch do
        service = Tasks::SingleUse::Services::DescriptionToContentBuilderMigrationService.new(reporter: reporter)
        service.migrate(persist: persist)
        stats = service.stats
      end
      stats.each { |key, value| totals[key] += value }

      verb = dry_run ? 'WOULD MIGRATE' : 'MIGRATED'
      Rails.logger.info "   📊 #{verb}: #{stats[:migrated]} (projects: #{stats[:projects_migrated]}, folders: #{stats[:folders_migrated]})"
      Rails.logger.info "      ├─ new layouts: #{stats[:created]}"
      Rails.logger.info "      └─ re-enabled disabled layouts: #{stats[:remigrated_disabled]} (of which had builder content: #{stats[:remigrated_disabled_with_content]})"
      Rails.logger.info "      └─ blank descriptions given a default layout: #{stats[:created_blank]}"
      Rails.logger.info "   ⏭️  Skipped — already on builder: #{stats[:skipped_existing]}"
      Rails.logger.info "   ⚠️  ERRORS: #{stats[:errors]}" if stats[:errors] > 0
    end

    Rails.logger.info "\n#{'=' * 80}"
    Rails.logger.info(dry_run ? '📊 DRY RUN SUMMARY (all tenants):' : '📊 MIGRATION SUMMARY (all tenants):')
    Rails.logger.info "   #{dry_run ? 'Would migrate' : 'Migrated'}: #{totals[:migrated]} (projects: #{totals[:projects_migrated]}, folders: #{totals[:folders_migrated]})"
    Rails.logger.info "      New layouts: #{totals[:created]}"
    Rails.logger.info "      Re-enabled disabled layouts: #{totals[:remigrated_disabled]} (of which had builder content: #{totals[:remigrated_disabled_with_content]})"
    Rails.logger.info "      Blank descriptions given a default layout: #{totals[:created_blank]}"
    Rails.logger.info "   Skipped (already on builder): #{totals[:skipped_existing]}"
    Rails.logger.info "   Errors: #{totals[:errors]}"

    report_file = dry_run ? 'descr_migration_dry_run.json' : 'descr_migration.json'
    reporter.report!(report_file)
    Rails.logger.info "   📝 Per-record report (every created/overwritten layout): #{report_file}"

    if dry_run
      Rails.logger.info "\n💡 To run the actual migration:"
      Rails.logger.info '   docker compose run web bundle exec rake single_use:migrate_descriptions_to_content_builder'
    else
      Rails.logger.info "\n✅ Migration completed."
    end
    Rails.logger.info '=' * 80
  end
end
