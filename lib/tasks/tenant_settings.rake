
namespace :tenant_settings do

  desc "Enable tenant feature"
  task :enable_feature, [:feature] => [:environment] do |t, args|
    failed = []
    Tenant.where.not(host: 'i18n.stg.citizenlab.co').each do |tn| 
      Apartment::Tenant.switch(tn.schema_name) do
        tn.settings[args[:feature]] = {'allowed' => true, 'enabled' => true}
        failed += [tn.host] if !tn.save
      end
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end

  desc "Disable tenant feature"
  task :disable_feature, [:feature] => [:environment] do |t, args|
    failed = []
    Tenant.where.not(host: 'i18n.stg.citizenlab.co').each do |tn| 
      Apartment::Tenant.switch(tn.schema_name) do
        tn.settings[args[:feature]] = {'allowed' => false, 'enabled' => false}
        failed += [tn.host] if !tn.save
      end
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end

end