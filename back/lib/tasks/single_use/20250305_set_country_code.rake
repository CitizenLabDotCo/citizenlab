# frozen_string_literal: true

# 09-03-25
# Requires CountryCodeService, now removed, which also required geocoder gem, now removed.
namespace :single_use do
  desc 'Set country_code for all tenants with a lat and lng'
  task set_country_code: :environment do
    Tenant.safe_switch_each do |tenant|
      puts "processing tenant #{tenant.host} ..."

      config = AppConfiguration.instance
      settings = config.settings
      lat = settings.dig('maps', 'map_center', 'lat')
      long = settings.dig('maps', 'map_center', 'long')

      if lat && long
        country_code = CountryCodeService.new.get_country_code(lat, long)
        config.country_code = country_code

        if country_code
          if config.save
            puts "  Set country_code to '#{country_code}' for tenant #{tenant.host}"
          else
            error = config.errors.full_messages.join(', ')
            puts "  FAILED to set country_code for tenant #{tenant.id} #{tenant.host}, with error: #{error}"
          end
        else
          puts "  FAILED to set country_code for tenant #{tenant.id} #{tenant.host}, with lat: #{lat} and long: #{long}"
        end
      else
        puts "  FAILED - No lat and/or long for tenant #{tenant.id} #{tenant.host}"
      end
    end
  end
end
