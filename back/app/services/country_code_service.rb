class CountryCodeService
  def get_country_code(lat, lng)
    return nil if lat.nil? || lng.nil?

    location = Geocoder.search([lat, lng]).first
    location&.country_code&.upcase
  end
end
