
namespace :fix_existing_tenants do
  desc "Fix the counts for all existing tenants."
  task :fix_project_ordering => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      Apartment::Tenant.switch(tenant.schema_name) do
        Project::PUBLICATION_STATUSES.each do |ps|
          Project.where(publication_status: ps).each.with_index do |project, i|
            project.update_column(:ordering, i)
          end
        end
      end
    end
  end
end