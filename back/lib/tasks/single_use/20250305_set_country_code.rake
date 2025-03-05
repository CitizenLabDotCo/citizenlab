# frozen_string_literal: true

namespace :single_use do
  desc 'Set country_code for all tenants with a lat and lng'
  task set_country_code: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "processing tenant #{tenant.name}"

      config = AppConfiguration.instance
      settings = config.settings
      lat = settings.dig('maps', 'map_center', 'lat')
      long = settings.dig('maps', 'map_center', 'long')

      if lat && long
        country_code = CountryCodeService.new.get_country_code(lat, lng)
        config.country_code = country_code

        if country_code
          if config.save
            puts "  Set country_code to #{country_code} for tenant #{tenant.name}"
          else
            error = config.errors.full_messages.join(', ')
            puts "  FAILED to set country_code for tenant #{tenant.name}, with error: #{error}"
        else
          puts "  FAILED to set country_code for tenant #{tenant.name}, with lat: #{lat} and long: #{long}"
        end
      end
    end
  end
end
