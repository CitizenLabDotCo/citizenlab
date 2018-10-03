namespace :fix_existing_tenants do
  desc "Add the missing permissions."
  task :update_permissions => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        Project.all.each do |project|
          PermissionsService.new.update_permissions_for project
          project.phases.each do |phase|
            PermissionsService.new.update_permissions_for phase
          end
        end
        Permission.all.each do |permission|
          permission.destroy! if !permission.valid?
        end
      end
    end
  end
end