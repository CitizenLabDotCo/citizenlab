# lib/tasks/temporary/users.rake

def each_tenant
  Tenant.all.each do |tenant|
    Apartment::Tenant.switch(tenant.schema_name) do
      yield tenant if block_given?
    end
  end
end

namespace :app_configurations do
  desc "Migrate data from 'tenants' table to 'app_configurations' table"
  task :import_from_tenants => :environment do
    each_tenant do |tenant|
      AppConfiguration.instance.update!(
          logo: tenant.logo,
          header_bg: tenant.header_bg,
          favicon: tenant.favicon,
          settings: tenant.settings,
          style: tenant.style
      )
    rescue => e
      Rails.logger.error("failed", tenant: tenant.id, error: e.full_message)
    end
  end

  desc "Delete tenant images"
  task :delete_tenant_s3_images => :environment do
    each_tenant do |tenant|
      tenant.remove_logo!
      tenant.remove_favicon!
      tenant.remove_header_bg!
      tenant.save
    end
  end
end
