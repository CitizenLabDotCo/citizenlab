
namespace :fix_existing_tenants do
  desc "Set the lifecycle stages and organization types to the values given in the sheet, remove demo values for organization_type"
  task :lifecycle_stage, [:url] => [:environment] do |t, args|
    organization_types = Tenant.settings_json_schema.dig('properties','core','properties','organization_type','enum')
    lifecycle_stages = Tenant.settings_json_schema.dig('properties','core','properties','lifecycle_stage','enum')
    log = []

    # set the lifecycle stages and organization types to the values given in the sheet
    ls_read_csv(args).each do |row|
      tenant = Tenant.find_by(host: row['host'])
      if tenant
        if organization_types.include? row['organization_type']
          tenant.settings['core']['organization_type'] = row['organization_type']
          log += ["#{row['host']}: organization_type set to #{row['organization_type']}"]
        end
        if lifecycle_stages.include? row['lifecycle_stage']
          tenant.settings['core']['lifecycle_stage'] = row['lifecycle_stage']
          log += ["#{row['host']}: lifecycle_stage set to #{row['lifecycle_stage']}"]
        end
        tenant.save!
      end
    end

    # remove demo values for organization_type
    Tenant.all.each do |tenant|
      if tenant.settings.dig('core','organization_type') == 'demo'
        tenant.settings['core']['organization_type'] = 'medium_city'
        tenant.save!
        log += ["#{tenant.host}: organization_type (which was demo) set to medium_city"]
      end
    end

    log.each{|msg| puts msg}
  end

  def ls_read_csv args
    CSV.parse(open(args[:url]).read, { headers: true, col_sep: ',', converters: [] })
  end
end