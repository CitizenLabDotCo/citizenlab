namespace :fix_existing_tenants do

  TIMEZONE_MAPPING = {
    'Africa/Dakar'          => 'UTC',
    'Africa/Johannesburg'   => 'Cairo',
    'Africa/Kampala'        => 'Nairobi',
    'Africa/Lagos'          => 'West Central Africa',
    'America/Lima'          => 'Lima',
    'America/Port_of_Spain' => 'Atlantic Time (Canada)',
    'America/Santiago'      => 'Santiago',
    'Asia/Bishkek'          => 'Almaty',
    'Australia/Sydney'      => 'Sydney',
    'Canada/Central'        => 'Central Time (US & Canada)',
    'Canada/Pacific'        => 'Pacific Time (US & Canada)',
    'Chile/Continental'     => 'Santiago',
    'Etc/GMT-0'             => 'UTC',
    'Etc/GMT+11'            => 'Fiji',
    'Etc/GMT-3'             => 'Atlantic Time (Canada)',
    'Etc/GMT-4'             => 'Atlantic Time (Canada)',
    'Etc/GMT-5'             => 'Lima',
    'Etc/GMT-8'             => 'Pacific Time (US & Canada)',
    'Etc/GMT+9'             => 'Yakutsk',
    'Etc/Greenwich'         => 'UTC',
    'Europe/Amsterdam'      => 'Amsterdam',
    'Europe/Berlin'         => 'Berlin',
    'Europe/Brussels'       => 'Brussels',
    'Europe/Copenhagen'     => 'Copenhagen',
    'Europe/London'         => 'London',
    'Europe/Prague'         => 'Prague',
    'Europe/Zurich'         => 'Zurich',
    'US/Central'            => 'Central Time (US & Canada)',
    'US/Pacific'            => 'Pacific Time (US & Canada)'
  }


  desc "Fix the old timezones values in the tenant settings by mapping them to the new timezone values"
  task :fix_timezones => [:environment] do |t, args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      tz = tenant.settings.dig('core', 'timezone')
      if !ActiveSupport::TimeZone.all.map(&:name).include?(tz)
        new_tz = TIMEZONE_MAPPING[tz]
        if !new_tz
          puts "No timezone mapping found for #{tz}!"
          new_tz = 'Brussels'
        end
        puts "Mapping to #{new_tz}"
        tenant.settings['core']['timezone'] = new_tz
        if !tenant.save
          puts "Failed for #{tenant.host}!"
        end
      end
    end
  end
end