namespace :matomo_sites do
  desc "Migration task : creates a matomo site for each tenant and register it in the tenant's settings"
  task :setup_matomo_site_for_each_tenant => :environment do |t, args|
    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PublishGenericEventToRabbitJob.perform_now({item_content: tenant}, 'tenant.setup_matomo')
      end
    end
  end

  desc "Migration task : creates a matomo site for each tenant that still has default settings"
  task :setup_matomo_site_for_failed_tenants => :environment do |t, args|
    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        next unless tenant.configuration.settings('matomo', 'tenant_site_id') ==  ENV.fetch('DEFAULT_MATOMO_TENANT_SITE_ID')
        PublishGenericEventToRabbitJob.perform_now({item_content: tenant}, 'tenant.setup_matomo')
      end
    end
  end

end
