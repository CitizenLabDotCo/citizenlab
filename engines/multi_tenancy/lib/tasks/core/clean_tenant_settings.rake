
namespace :cl2back do

  desc "Clean all tenant settings"
  task :clean_tenant_settings => :environment do
    Tenant.all.each do |tenant|
      puts "Cleaning tenant settings for tenant #{tenant.name}"
      tenant.cleanup_settings
      tenant.save
    end
  end
end
