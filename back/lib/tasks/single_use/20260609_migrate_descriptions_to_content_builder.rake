# frozen_string_literal: true

require_relative 'services/description_to_content_builder_migration_service'

# Wraps each project/folder `description_multiloc` (legacy WYSIWYG) into a single
# Content Builder "bridge" widget (RichTextMultiloc) at full fidelity, so the
# citizen page renders the description through the Content Builder. The legacy
# `description_multiloc` is left untouched.
#
# - Skips blank descriptions and buildables already on the Content Builder, so it
#   is idempotent and resumable.
# - Use DRY_RUN=true to analyse without writing. Use HOST=<host> to limit to one
#   tenant.
#
#   docker compose run web bundle exec rake single_use:migrate_descriptions_to_content_builder DRY_RUN=true
#   docker compose run web bundle exec rake single_use:migrate_descriptions_to_content_builder HOST=localhost
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

    tenants.each do |tenant|
      Rails.logger.info "\n🏢 Processing tenant: #{tenant.host}"
      stats = nil
      tenant.switch do
        service = Tasks::SingleUse::Services::DescriptionToContentBuilderMigrationService.new
        service.migrate(persist: persist)
        stats = service.stats
      end
      stats.each { |key, value| totals[key] += value }

      verb = dry_run ? 'WOULD MIGRATE' : 'MIGRATED'
      Rails.logger.info "   📊 #{verb}: #{stats[:migrated]} (projects: #{stats[:projects_migrated]}, folders: #{stats[:folders_migrated]})"
      Rails.logger.info "   ⏭️  Skipped — blank: #{stats[:skipped_blank]}, already on builder: #{stats[:skipped_existing]}"
      Rails.logger.info "   ⚠️  ERRORS: #{stats[:errors]}" if stats[:errors] > 0
    end

    Rails.logger.info "\n#{'=' * 80}"
    Rails.logger.info(dry_run ? '📊 DRY RUN SUMMARY (all tenants):' : '📊 MIGRATION SUMMARY (all tenants):')
    Rails.logger.info "   #{dry_run ? 'Would migrate' : 'Migrated'}: #{totals[:migrated]} (projects: #{totals[:projects_migrated]}, folders: #{totals[:folders_migrated]})"
    Rails.logger.info "   Skipped (blank description): #{totals[:skipped_blank]}"
    Rails.logger.info "   Skipped (already on builder): #{totals[:skipped_existing]}"
    Rails.logger.info "   Errors: #{totals[:errors]}"

    if dry_run
      Rails.logger.info "\n💡 To run the actual migration:"
      Rails.logger.info '   docker compose run web bundle exec rake single_use:migrate_descriptions_to_content_builder'
    else
      Rails.logger.info "\n✅ Migration completed."
    end
    Rails.logger.info '=' * 80
  end
end
