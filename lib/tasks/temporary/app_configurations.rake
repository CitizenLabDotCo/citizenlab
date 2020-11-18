# lib/tasks/temporary/users.rake
namespace :app_configurations do
  desc "Migrate data from 'tenants' table to 'app_configurations' table"
  task :import_from_tenant => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        AppConfigurations.instance.update!(
          logo: tenant.logo,
          header_bg: tenant.header_bg,
          favicon: tenant.favicon,
          settings: tenant.settings,
          style: tenant.style
        )
      end
    end
  end
end