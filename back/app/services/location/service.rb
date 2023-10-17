# frozen_string_literal: true

class Location::Service
  def autocomplete(input, language)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/place/autocomplete/json?input=#{input}&key=#{api_key}&language=#{language}")
    { results: response['predictions'].pluck('description') }
  end

  def geocode(address, language)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/geocode/json?address=#{address}&key=#{api_key}&language=#{language}")
    { location: response['results'].first['geometry']['location'] }
  end

  def reverse_geocode(lat, lng, language)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=#{lat},#{lng}&key=#{api_key}&language=#{language}")
    { formatted_address: response['results'].first['formatted_address'] }
  end

  private

  def api_key
    ENV.fetch('GOOGLE_MAPS_API_KEY', nil)
  end
end
