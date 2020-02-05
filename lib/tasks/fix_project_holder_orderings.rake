namespace :fix_existing_tenants do
  desc "Fix the counts for all existing tenants."
  task :fix_project_holder_orderings => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        ProjectHolderService.new.fix_project_holder_orderings!
      end
    end
  end
end