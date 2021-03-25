namespace :fix_existing_tenants do
  desc "Migrate permitted_by values to new users value for some existing permissions"
  task :migrate_users_permitted_by => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        Permission.where(permitted_by: 'everyone').where.not(action: 'taking_survey').update_all(permitted_by: 'users')
      end
    end
  end
end