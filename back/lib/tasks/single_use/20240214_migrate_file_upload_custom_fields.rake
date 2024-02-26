# frozen_string_literal: true

namespace :single_use do
  desc 'Transform all core data relating to votes into reactions'
  task :migrate_file_upload_custom_fields, %i[persist_changes specify_host] => [:environment] do |_t, args|
    persist_changes = args[:persist_changes] == 'true'
    specify_host = args[:specify_host]
    Rails.logger.info 'DRY RUN: Changes will not be persisted' unless persist_changes
    stats = {}

    Tenant.prioritize(Tenant.creation_finalized).each do |tenant|
      next unless tenant.host == specify_host || specify_host.blank?

      Rails.logger.info "PROCESSING TENANT: #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        field_migrator = Tasks::SingleUse::Services::FileUploadCustomFieldMigrationService.new
        field_migrator.migrate(persist_changes)
        stats[tenant.host] = field_migrator.stats
      end
    end

    # Output all the stats
    stats.each do |host, tenant_stats|
      Rails.logger.info "STATS: #{host} - ideas: #{tenant_stats[:ideas]}, file_fields: #{tenant_stats[:file_fields]}, ideas_updated: #{tenant_stats[:ideas_updated]}"
      tenant_stats[:errors].each do |error|
        Rails.logger.info "ERROR: #{error}"
      end
    end
  end
end
