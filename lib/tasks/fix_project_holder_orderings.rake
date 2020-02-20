namespace :fix_existing_tenants do
  desc "Fix the holders for all existing tenants."
  task :fix_project_holder_orderings => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        ProjectHolderService.new.fix_project_holder_orderings!
      end
    end
  end

  desc "Fix the project-related orderings and holders for all existing tenants."
  task :fix_all_project_related_orderings => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        ProjectHolderService.new.fix_project_holder_orderings!
        ['published', 'draft', 'archived'].each do |publication_status|
          Project.where(publication_status: publication_status).order(:ordering).each do |project|
            project.project_holder_ordering&.move_to_bottom
          end
        end
      end
    end
  end
end