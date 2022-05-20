# frozen_string_literal: true

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
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of campaigns per page'
    end

    context "When ideas have same locale" do
      let!(:ideas) do
        create_list(:idea, 2, title_multiloc: { 'nl-BE' => 'Een fietspad in het Prinsenbos van Grimbergen' })
      end

      before do
        allow_any_instance_of(NLP::Api).to receive(:geotag).with(
          instance_of(String), instance_of(String), instance_of(String), anything
        ).and_return([geocoded])
        do_request
      end

      example 'Returns the right status code' do
        expect(status).to eq 200
      end

      example 'List all ideas geotagged' do
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end

    context "When ideas have different locales" do
      let!(:ideas) do
        [
          create(:idea, title_multiloc: { 'nl-BE' => 'Een fietspad in het Prinsenbos van Grimbergen' }),
          create(:idea, title_multiloc: { 'en' => 'A bicycle lane in the Prinsenbos of Grimbergen' })
        ]
      end

      before do
        allow_any_instance_of(NLP::Api).to receive(:geotag).with(
          instance_of(String), instance_of(String), instance_of(String), anything
        ).and_return([geocoded])
        do_request
      end

      example 'List all ideas geotagged (different locales)' do
        json_response = json_parse(response_body)
        expect(json_response[:data].size).to eq 2
      end
    end
  end
end
