# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Location' do
  explanation 'User request location data.'

  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/location/textsearch' do
    parameter :query, 'Search query', required: true
    
    let(:query) { 'New York' }
    
    before do
      allow(HTTParty).to receive(:get).and_return({ 'results' => [{ 'formatted_address' => 'New York, NY, USA' }] })
    end
    
    example_request 'Textsearch' do
      expect(status).to eq(200)
      expect(response_data[:attributes]).to match_array(['New York, NY, USA'])
    end
  end

  get 'web_api/v1/location/geocode' do
    parameter :address, 'Address', required: true

    let(:address) { 'New York' }

    before do
      allow(HTTParty).to receive(:get).and_return({ 'results' => [{ 'geometry' => { 'location' => { lat: 40.7127753, lng: -74.0059728 } } }] })
    end

    example_request 'Geocode' do
      expect(status).to eq(200)
      expect(response_data[:attributes]).to eq({ lat: 40.7127753, lng: -74.0059728 })
    end
  end

  get 'web_api/v1/location/reverse_geocode' do
    parameter :lat, 'Latitude', required: true
    parameter :lng, 'Longitude', required: true

    let(:lat) { 40.714224 }
    let(:lng) { -73.961452 }

    before do
      allow(HTTParty).to receive(:get).and_return({ 'results' => [{ 'formatted_address' => '277 Bedford Ave, Brooklyn, NY 11211, USA' }] })
    end

    example_request 'Reverse geocode' do
      expect(status).to eq(200)
      expect(response_data[:attributes]).to eq('277 Bedford Ave, Brooklyn, NY 11211, USA')
    end
  end
end