class Location::Service
  def textsearch(query)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/place/textsearch/json?query=#{query}&key=#{api_key}&radius=100000000000")
    {results: response['results'].map { |item| item['formatted_address'] } }
  end

  def geocode(address)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/geocode/json?address=#{address}&key=#{api_key}")
    { location: response['results'].first['geometry']['location'] }
  end

  def reverse_geocode(lat, lng)
    response = HTTParty.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=#{lat},#{lng}&key=#{api_key}")
    { formatted_address: response['results'].first['formatted_address'] }
  end

  private

  def api_key
    ENV['GOOGLE_MAPS_API_KEY']
  end
end