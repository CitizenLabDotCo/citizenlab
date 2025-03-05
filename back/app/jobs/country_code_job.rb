class CountryCodeJob < ApplicationJob
  queue_as :default
  # creates or updates country_code in app_configurations
  
  def run
    app_config = AppConfiguration.instance
   
    country_code = CountryCodeService.new.get_country_code(app_config.latitude, app_config.longitude)
    app_config.update(country_code: country_code) if country_code.present?
  end
end
