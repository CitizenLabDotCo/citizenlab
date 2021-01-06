# lib/tasks/temporary/users.rake

namespace :app_configurations do
  desc "Migrate data from 'tenants' table to 'app_configurations' table"
  task :import_from_tenants => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        AppConfiguration.instance.update!(
            host: tenant.host,
            logo: tenant.logo,
            header_bg: tenant.header_bg,
            favicon: tenant.favicon,
            settings: tenant.settings,
            style: tenant.style,
            created_at: tenant.created_at
        )
      rescue => e
        Rails.logger.error("failed", tenant: tenant.id, error: e.full_message)
      end
    end
  end

  desc "Delete tenant images"
  task :delete_tenant_images => :environment do
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        tenant.remove_logo!
        tenant.remove_favicon!
        tenant.remove_header_bg!
        tenant.save
      rescue => e
        Rails.logger.error("failed", tenant: tenant.id, error: e.full_message)
      end
    end
  end

end
