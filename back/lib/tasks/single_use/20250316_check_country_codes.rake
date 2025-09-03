# frozen_string_literal: true

namespace :single_use do
  desc 'Check country_code core setting'
  task check_country_code_core_setting: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "processing tenant #{tenant.host} ..."

      config = AppConfiguration.instance
      existing_code = config.settings.dig('core', 'country_code')

      if existing_code
        puts '  OK'
      else
        puts "  FAILED - no country_code found for #{tenant.id}, #{tenant.host}"
      end
    end
  end
end
