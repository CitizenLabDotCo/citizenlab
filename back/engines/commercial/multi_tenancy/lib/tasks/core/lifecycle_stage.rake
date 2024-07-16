# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Set the lifecycle stages and organization types to the values given in the sheet, remove demo values for organization_type'
  task :lifecycle_stage, [:url] => [:environment] do |_t, args|
    core_settings_json_schema = AppConfiguration::Settings.json_schema.dig('properties', 'core')
    organization_types = core_settings_json_schema.dig('properties', 'organization_type', 'enum')
    lifecycle_stages = core_settings_json_schema.dig('properties', 'lifecycle_stage', 'enum')
    log = []

    # set the lifecycle stages and organization types to the values given in the sheet
    ls_read_csv(args).each do |row|
      tenant = Tenant.find_by(host: row['host'])
      next unless tenant

      app_config = tenant.configuration

      if organization_types.include? row['organization_type']
        app_config.settings['core']['organization_type'] = row['organization_type']
        log += ["#{row['host']}: organization_type set to #{row['organization_type']}"]
      end

      if lifecycle_stages.include? row['lifecycle_stage']
        app_config.settings['core']['lifecycle_stage'] = row['lifecycle_stage']
        log += ["#{row['host']}: lifecycle_stage set to #{row['lifecycle_stage']}"]
      end

      app_config.save!
    end

    # remove demo values for organization_type
    Tenant.all.each do |tenant|
      app_config = tenant.configuration
      next unless app_config.settings('core', 'organization_type') == 'demo'

      app_config.settings['core']['organization_type'] = 'medium_city'
      app_config.save!
      log += ["#{tenant.host}: organization_type (which was demo) set to medium_city"]
    end

    log.each { |msg| puts msg }
  end

  def ls_read_csv(args)
    CSV.parse(open(args[:url]).read, headers: true, col_sep: ',', converters: [])
  end
end
