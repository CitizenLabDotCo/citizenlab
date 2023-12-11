# frozen_string_literal: true

require_relative 'services/continuous_project_migration_service'

# to persist changes run: single_use:migrate_continuous_projects[true]
# to persist changes for one host run: single_use:migrate_continuous_projects[true,localhost]
namespace :single_use do
  desc 'Migrate all continuous projects to timeline projects with a single phase'
  task :migrate_continuous_projects, %i[persist_changes specify_host] => [:environment] do |_t, args|
    persist_changes = args[:persist_changes] == 'true'
    specify_host = args[:specify_host]
    Rails.logger.info 'DRY RUN: Changes will not be persisted' unless persist_changes
    stats = {}

    # TODO: Test that it continues if there are errors
    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      next unless tenant.host == specify_host || specify_host.blank?

      Rails.logger.info "PROCESSING TENANT: #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        project_migrator = Tasks::SingleUse::Services::ContinuousProjectMigrationService.new
        project_migrator.migrate(persist_changes)
        stats[tenant.host] = project_migrator.stats
      end
    end

    # Output all the stats
    stats.each do |host, tenant_stats|
      Rails.logger.info "STATS: #{host} - projects: #{tenant_stats[:projects]}, successful: #{tenant_stats[:success]}, records_updated: #{tenant_stats[:records_updated]}"
      tenant_stats[:errors].each do |error|
        Rails.logger.info "ERROR: #{error}"
      end
    end
  end
end

namespace :single_use do
  desc 'Fix survey forms on staging'
  task :migrate_continuous_forms_fix, %i[specify_host] => [:environment] do |_t, args|
    specify_host = args[:specify_host]
    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      next unless tenant.host == specify_host || specify_host.blank?

      Rails.logger.info "PROCESSING TENANT: #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        project_migrator = Tasks::SingleUse::Services::ContinuousProjectMigrationService.new
        project_migrator.fix_survey_custom_forms
      end
    end
  end
end
