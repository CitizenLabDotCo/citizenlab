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
      stub_request(:get, 'https://maps.googleapis.com/maps/api/place/autocomplete/json')
        .with(query: hash_including({ input: input }))
        .to_return(
          status: 200,
          body: { 'predictions' => [{ 'description' => 'New York, NY, USA' }] }.to_json,
          headers: { content_type: 'application/json' }
        )
    end

    example_request 'Autocomplete' do
      expect(status).to eq(200)
      expect(response_data[:attributes][:results]).to contain_exactly('New York, NY, USA')
    end
  end

  get 'web_api/v1/location/geocode' do
    parameter :address, 'Address', required: true
    parameter :language, 'Language', required: false

    context 'an address' do
      let(:address) { 'New York' }

      before do
        stub_request(:get, 'https://maps.googleapis.com/maps/api/geocode/json')
          .with(query: hash_including({ address: address }))
          .to_return(
            status: 200,
            body: { 'results' => [{ 'geometry' => { 'location' => { 'lat' => 40.7127753, 'lng' => -74.0059728 } } }] }.to_json,
            headers: { content_type: 'application/json' }
          )
      end

      example_request 'Address Geocoded' do
        expect(status).to eq(200)
        expect(response_data[:attributes][:location]).to eq({ lat: 40.7127753, lng: -74.0059728 })
      end
    end

    context 'co-ordinates' do
      let(:address) { '48.32895308112715,16.04415893554688' }

      example_request 'Exact co-ordinates returned unaltered' do
        expect(status).to eq(200)
        expect(response_data[:attributes][:location]).to eq({ lat: 48.32895308112715, lng: 16.04415893554688 })
      end
    end
  end

  get 'web_api/v1/location/reverse_geocode' do
    parameter :lat, 'Latitude', required: true
    parameter :lng, 'Longitude', required: true
    parameter :language, 'Language', required: false

    let(:lat) { 40.714224 }
    let(:lng) { -73.961452 }

    before do
      stub_request(:get, 'https://maps.googleapis.com/maps/api/geocode/json')
        .with(query: hash_including({ latlng: "#{lat},#{lng}" }))
        .to_return(
          status: 200,
          body: { 'results' => [{ 'formatted_address' => '277 Bedford Ave, Brooklyn, NY 11211, USA' }] }.to_json,
          headers: { content_type: 'application/json' }
        )
    end

    example_request 'Reverse geocode' do
      expect(status).to eq(200)
      expect(response_data[:attributes][:formatted_address]).to eq('277 Bedford Ave, Brooklyn, NY 11211, USA')
    end
  end
end
