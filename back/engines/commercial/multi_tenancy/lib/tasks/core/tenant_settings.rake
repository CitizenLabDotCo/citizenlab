# frozen_string_literal: true

namespace :tenant_settings do
  desc 'Enable tenant feature'
  task :enable_feature, [:feature] => [:environment] do |_t, args|
    failed = []
    Tenant.where.not(host: 'i18n.stg.citizenlab.co').each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        config = AppConfiguration.instance
        config.settings[args[:feature]]['allowed'] = true
        config.settings[args[:feature]]['enabled'] = true
        failed += [tn.host] unless config.save
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
    failed = []
    Tenant.where.not(host: 'i18n.stg.citizenlab.co').each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        config = AppConfiguration.instance
        config.settings[args[:feature]]['allowed'] = false
        config.settings[args[:feature]]['enabled'] = false
        failed += [tn.host] unless config.save
      end
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end

  # Usage:
  #   bundle exec rake tenant_settings:enable_feature_for_tenants[feature,url]
  # Example:
  #   bundle exec rake tenant_settings:enable_feature_for_tenants['participatory_budgeting','/tenants.txt']
  #   Where /tmp/tenants.txt contains a list of tenant hosts, one per line. Example line: participer.grandparissud.fr
  desc 'Enable tenant feature for specific tenants'
  task :enable_feature_for_tenants, %i[feature url] => [:environment] do |_t, args|
    tenants = File.readlines(args[:url]).map(&:strip)

    not_found = tenants - Tenant.all.pluck(:host)
    puts "WARNING! The following tenants were not found: #{not_found.join(', ')}" if not_found.present?

    failed = []
    Tenant.where(host: tenants).each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        config = AppConfiguration.instance
        config.settings[args[:feature]]['allowed'] = true
        config.settings[args[:feature]]['enabled'] = true

        if config.save
          puts "Successfully enabled #{args[:feature]} for #{tn.host}"
        else
          failed += [tn.host]
        end
      end
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end

  # Usage:
  #   bundle exec rake tenant_settings:disable_feature_for_tenants[feature,url]
  # Example:
  #   bundle exec rake tenant_settings:disable_feature_for_tenants['participatory_budgeting','/tenants.txt']
  #   Where /tmp/tenants.txt contains a list of tenant hosts, one per line. Example line: participer.grandparissud.fr
  desc 'Disable tenant feature for specific tenants'
  task :disable_feature_for_tenants, %i[feature url] => [:environment] do |_t, args|
    tenants = File.readlines(args[:url]).map(&:strip)

    not_found = tenants - Tenant.all.pluck(:host)
    puts "WARNING! The following tenants were not found: #{not_found.join(', ')}" if not_found.present?

    failed = []
    Tenant.where(host: tenants).each do |tn|
      Apartment::Tenant.switch(tn.schema_name) do
        config = AppConfiguration.instance
        config.settings[args[:feature]]['allowed'] = false
        config.settings[args[:feature]]['enabled'] = false

        if config.save
          puts "Successfully disabled #{args[:feature]} for #{tn.host}"
        else
          failed += [tn.host]
        end
      end
    end
    if failed.present?
      puts "Failed for: #{failed.join(', ')}"
    else
      puts 'Success!'
    end
  end
end
