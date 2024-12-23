# frozen_string_literal: true

namespace :tenant_settings do
  desc 'Enable tenant feature'
  task :enable_feature, [:feature] => [:environment] do |_t, args|
    feature = args[:feature]
    failed = []
    Tenant.where.not(host: 'i18n.stg.citizenlab.co').each do |tn|
      tn.switch do
        app_config = AppConfiguration.instance
        app_config.settings[feature]['allowed'] = true
        app_config.settings[feature]['enabled'] = true
        failed += [tn.host] unless app_config.save
      end
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end

  desc 'Disable tenant feature'
  task :disable_feature, [:feature] => [:environment] do |_t, args|
    feature = args[:feature]
    failed = []
    Tenant.where.not(host: 'i18n.stg.citizenlab.co').each do |tn|
      tn.switch do
        app_config = AppConfiguration.instance
        app_config.settings[feature]['allowed'] = false
        app_config.settings[feature]['enabled'] = false
        failed += [tn.host] unless app_config.save
      end
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end
end
