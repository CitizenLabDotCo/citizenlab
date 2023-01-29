# frozen_string_literal: true

namespace :fix_existing_tenants do
  timezone_mapping = {
    'Africa/Dakar' => 'UTC',
    'Africa/Johannesburg' => 'Cairo',
    'Africa/Kampala' => 'Nairobi',
    'Africa/Lagos' => 'West Central Africa',
    'America/Lima' => 'Lima',
    'America/Port_of_Spain' => 'Atlantic Time (Canada)',
    'America/Santiago' => 'Santiago',
    'Asia/Bishkek' => 'Almaty',
    'Australia/Sydney' => 'Sydney',
    'Canada/Central' => 'Central Time (US & Canada)',
    'Canada/Pacific' => 'Pacific Time (US & Canada)',
    'Chile/Continental' => 'Santiago',
    'Etc/GMT-0' => 'UTC',
    'Etc/GMT+11' => 'Fiji',
    'Etc/GMT-3' => 'Atlantic Time (Canada)',
    'Etc/GMT-4' => 'Atlantic Time (Canada)',
    'Etc/GMT-5' => 'Lima',
    'Etc/GMT-8' => 'Pacific Time (US & Canada)',
    'Etc/GMT+9' => 'Yakutsk',
    'Etc/Greenwich' => 'UTC',
    'Europe/Amsterdam' => 'Amsterdam',
    'Europe/Berlin' => 'Berlin',
    'Europe/Brussels' => 'Brussels',
    'Europe/Copenhagen' => 'Copenhagen',
    'Europe/London' => 'London',
    'Europe/Prague' => 'Prague',
    'Europe/Zurich' => 'Zurich',
    'US/Central' => 'Central Time (US & Canada)',
    'US/Pacific' => 'Pacific Time (US & Canada)'
  }.freeze

  desc 'Fix the old timezones values in the tenant settings by mapping them to the new timezone values'
  task fix_timezones: [:environment] do |_t, _args|
    Tenant.all.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      app_config = AppConfiguration.instance
      timezone = app_config.settings('core', 'timezone')
      next if ActiveSupport::TimeZone.all.map(&:name).include?(timezone)

      new_tz = timezone_mapping[timezone]
      unless new_tz
        puts "No timezone mapping found for #{timezone}!"
        new_tz = 'Brussels'
      end

      puts "Mapping to #{new_tz}"
      settings = app_config.settings
      settings['core']['timezone'] = new_tz
      puts "Failed for #{tenant.host}!" unless app_config.update(settings: settings)
    end
  end
end
