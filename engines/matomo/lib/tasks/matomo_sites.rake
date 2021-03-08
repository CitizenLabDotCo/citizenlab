namespace :matomo_sites do
  desc "Migration task : creates a matomo site for each tenant and register it in the tenant's settings"
  task :setup_matomo_site_for_each_tenant => :environment do |t, args|
    Tenant.all.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PublishGenericEventToRabbitJob.perform_now({item_content: tenant}, 'tenant.setup_matomo')
      end
    end
  end

end
