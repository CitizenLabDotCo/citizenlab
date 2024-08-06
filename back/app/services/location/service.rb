# frozen_string_literal: true

class Location::Service
  OK_STATUSES = %w[OK ZERO_RESULTS]

  def autocomplete(input, language)
    response = http_get("https://maps.googleapis.com/maps/api/place/autocomplete/json?input=#{CGI.escape(input)}&key=#{api_key}&language=#{language}")
    { results: response['predictions'].pluck('description') }
  end

  def geocode(address, language)
    # Pass through unaltered if valid co-ordinates are entered
    coordinates_regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
    if coordinates_regex.match? address
      split_coordinates = address.split(',')
      location = { lat: split_coordinates[0].to_f, lng: split_coordinates[1].to_f }
    else
      response = http_get("https://maps.googleapis.com/maps/api/geocode/json?address=#{CGI.escape(address)}&key=#{api_key}&language=#{language}")
      location = response['results'].first['geometry']['location']
    end
    { location: location }
  end

  def reverse_geocode(lat, lng, language)
    response = http_get("https://maps.googleapis.com/maps/api/geocode/json?latlng=#{lat},#{lng}&key=#{api_key}&language=#{language}")
    { formatted_address: response['results'].first['formatted_address'] }
  end

  private

  def http_get(url)
    HTTParty.get(url).tap do |response|
      if !response.success? || OK_STATUSES.exclude?(response['status'])
        ErrorReporter.report(GoogleMapsApiError.new, extra: { url: url, response: response })
      end
    end
  end

  def api_key
    ENV.fetch('GOOGLE_MAPS_API_KEY', nil)
  end

  class GoogleMapsApiError < StandardError; end
end
