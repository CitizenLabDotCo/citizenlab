# frozen_string_literal: true

namespace :cl2back do
  desc 'Clean all tenant settings'
  task clean_tenant_settings: :environment do
    Tenant.all.each do |tenant|
      puts "Cleaning tenant settings for tenant #{tenant.name}"
      Apartment::Tenant.switch(tenant.schema_name) do
        config = AppConfiguration.instance
        config.cleanup_settings
        config.save!
      end
    end
  end
end
