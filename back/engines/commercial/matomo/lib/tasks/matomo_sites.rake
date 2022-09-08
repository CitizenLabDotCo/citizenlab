# frozen_string_literal: true

namespace :matomo_sites do
  desc "Migration task : creates a matomo site for each tenant and register it in the tenant's settings"
  task setup_matomo_site_for_each_tenant: :environment do |_t, _args|
    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        PublishGenericEventToRabbitJob.perform_now({ item_content: tenant }, 'tenant.setup_matomo')
      end
    end
  end

  desc 'Migration task : creates a matomo site for each tenant that still has default settings'
  task setup_matomo_site_for_failed_tenants: :environment do |_t, _args|
    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        next unless tenant.configuration.settings('matomo', 'tenant_site_id') == ENV.fetch('DEFAULT_MATOMO_TENANT_SITE_ID')

        PublishGenericEventToRabbitJob.perform_now({ item_content: tenant }, 'tenant.setup_matomo')
      end
    end
  end

  desc 'Create default custom dimensions'
  task create_default_custom_dimensions: :environment do |_t, _args|
    site_id = ENV.fetch('DEFAULT_MATOMO_TENANT_SITE_ID')
    service = Matomo::Client.new
    service.create_default_custom_dimensions(site_id)
  end

  desc 'Create default custom dimensions for all tenants'
  task create_default_custom_dimensions_for_each_tenant: :environment do |_t, _args|
    Tenant.not_deleted.each do |tenant|
      Apartment::Tenant.switch(tenant.schema_name) do
        site_id = tenant.configuration.settings('matomo', 'tenant_site_id')
        service = Matomo::Client.new
        service.create_default_custom_dimensions(site_id)
      end
    end
  end
end
