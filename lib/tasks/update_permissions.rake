namespace :fix_existing_tenants do
  desc "Add the missing permissions."
  task :update_permissions => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PermissionsService.new.update_permissions_for_current_tenant
      end
    end
  end
end