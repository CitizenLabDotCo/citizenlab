# frozen_string_literal: true

namespace :fix_existing_tenants do
  # ActiveSupport::TimeZone::MAPPING
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
    mapping = ActiveSupport::TimeZone::MAPPING
    failures = {}

    Tenant.creation_finalized.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      config = AppConfiguration.instance
      old_timezone = config.settings('core', 'timezone')
      new_timezone = mapping[old_timezone]

      if new_timezone
        config.settings['core']['timezone'] = new_timezone
      else
        failures[old_timezone] ||= []
        failures[old_timezone] += [tenant.host]
        config.settings['core']['timezone'] = 'Europe/Brussels'
      end

      puts "Failed to save tenant #{tenant.host}: #{tenant.errors.details}" if !tenant.save
    end

    if failures.present?
      puts 'Some timezones could not be mapped!'
      pp failures
    end
  end
end
