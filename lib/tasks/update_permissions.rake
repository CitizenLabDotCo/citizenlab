namespace :fix_existing_tenants do
  desc "Add the missing permissions."
  task :update_permissions => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PermissionsService.new.update_permissions_for_current_tenant
      end
    end
  end

  desc "Add the missing global permissions."
  task :update_global_permissions => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PermissionsService.new.update_global_permissions
      end
    end
  end

  desc "Migrate permitted by's after introducing users value"
  task :migrate_permitted_bies => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Permission.where(permitted_by: 'everyone').not(action: 'taking_survey').update_all permitted_by: 'users'
      end
    end
  end
end