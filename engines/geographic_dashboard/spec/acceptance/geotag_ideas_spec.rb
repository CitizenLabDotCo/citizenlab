require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'GeotagIdeas' do
  explanation 'Returns ideas with their locations, geotagged if not specified by the author'

  let(:geocoded) do
    {
      'lat' => 50.9290945,
      'lon' => 4.37096336520241,
      'address' => 'Prinsenbos'
    }
  end

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  get '/web_api/v1/ideas/geotagged' do
    let!(:ideas) do
      create_list(:idea, 2, title_multiloc: { 'nl-BE' => 'Een fietspad in het Prinsenbos van Grimbergen' })
    end

    before do
      allow(GeographicDashboard::GeotagService.new).to receive(:geotag).and_return(geocoded)
      do_request
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of campaigns per page'
    end

    example 'Returns the right status code' do
      expect(status).to eq 200
    end

    example 'List all ideas geotagged' do
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end
end
