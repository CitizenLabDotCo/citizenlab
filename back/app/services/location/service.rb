# frozen_string_literal: true

class Location::Service
  def autocomplete(input, language)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/place/autocomplete/json?input=#{CGI.escape(input)}&key=#{api_key}&language=#{language}")
    { results: response['predictions'].pluck('description') }
  end

  def geocode(address, language)
    # Pass through unaltered if valid co-ordinates are entered
    coordinates_regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
    if coordinates_regex.match? address
      split_coordinates = address.split(',')
      location = { lat: split_coordinates[0].to_f, lng: split_coordinates[1].to_f }
    else
      response = HTTParty.get("https://maps.googleapis.com/maps/api/geocode/json?address=#{CGI.escape(address)}&key=#{api_key}&language=#{language}")
      location = response['results'].first['geometry']['location']
    end
    { location: location }
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
