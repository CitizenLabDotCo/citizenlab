# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Location' do
  explanation 'User request location data.'

  before do
    header 'Content-Type', 'application/json'
  end

  get 'web_api/v1/location/autocomplete' do
    parameter :input, 'Search input', required: true
    parameter :language, 'Language', required: false

    let(:input) { 'New York' }

    before do
      allow(HTTParty).to receive(:get).and_return({ 'predictions' => [{ 'description' => 'New York, NY, USA' }] })
    end

    example_request 'Autocomplete' do
      expect(status).to eq(200)
      expect(response_data[:attributes][:results]).to match_array(['New York, NY, USA'])
    end
  end

  get 'web_api/v1/location/geocode' do
    parameter :address, 'Address', required: true
    parameter :language, 'Language', required: false

    let(:address) { 'New York' }

    before do
      allow(HTTParty).to receive(:get).and_return({ 'results' => [{ 'geometry' => { 'location' => { lat: 40.7127753, lng: -74.0059728 } } }] })
    end

    example_request 'Geocode' do
      expect(status).to eq(200)
      expect(response_data[:attributes][:location]).to eq({ lat: 40.7127753, lng: -74.0059728 })
    end
  end

  get 'web_api/v1/location/reverse_geocode' do
    parameter :lat, 'Latitude', required: true
    parameter :lng, 'Longitude', required: true
    parameter :language, 'Language', required: false

    let(:lat) { 40.714224 }
    let(:lng) { -73.961452 }

    before do
      allow(HTTParty).to receive(:get).and_return({ 'results' => [{ 'formatted_address' => '277 Bedford Ave, Brooklyn, NY 11211, USA' }] })
    end

    example_request 'Reverse geocode' do
      expect(status).to eq(200)
      expect(response_data[:attributes][:formatted_address]).to eq('277 Bedford Ave, Brooklyn, NY 11211, USA')
    end
  end
end
