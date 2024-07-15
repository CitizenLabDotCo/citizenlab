namespace :single_use do
  desc 'Migrate permissions fields to use the new "custom" permitted_by.'
  task :migrate_permissions_fields, [] => [:environment] do
    Tenant.safe_switch_each do |tenant|
      Rails.logger.info "PROCESSING TENANT: #{tenant.host}..."

      service = Tasks::SingleUse::Services::CustomPermissionsMigrationService.new
      if service.permissions_fields_service.custom_permitted_by_enabled?
        service.change_permissions_to_custom
        Rails.logger.info 'Migrated permissions fields.'
      else
        Rails.logger.info "Feature flag 'custom_permitted_by' is not enabled."
      end
    end
  end
end
