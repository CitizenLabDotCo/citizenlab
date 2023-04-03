# frozen_string_literal: true

namespace :fix_existing_tenants do
  desc 'Fix the old timezones values in the tenant settings by mapping them to the new timezone values'
  task fix_timezones: [:environment] do |_t, _args|
    mapping = ActiveSupport::TimeZone::MAPPING
    failures = {}

    Tenant.creation_finalized.each do |tenant|
      puts "Processing tenant #{tenant.host}..."
      tenant.switch do
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

        puts "Failed to save tenant #{tenant.host}: #{tenant.errors.details}" if !config.save
      end
    end

    if failures.present?
      puts 'Some timezones could not be mapped!'
      pp failures
    end
  end
end
