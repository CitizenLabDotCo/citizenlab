# frozen_string_literal: true

namespace :single_use do
  desc 'Set country_code core setting with value from attribute'
  task set_country_code_core_setting: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "processing tenant #{tenant.host} ..."

      config = AppConfiguration.instance
      existing_code = config.country_code

      if existing_code
        config.settings['core']['country_code'] = existing_code
        if config.save
          puts "  Set country_code to '#{existing_code}' for tenant #{tenant.host}"
        else
          error = config.errors.full_messages.join(', ')
          puts "  FAILED to set country_code for tenant #{tenant.id}, #{tenant.host}, with error: #{error}"
        end
      else
        puts "  FAILED - no country_code found for #{tenant.id}, #{tenant.host}"
      end
    end
  end
end
