require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Areas" do
  before do
    @areas = create_list(:area, 5)
  end

  get "web_api/v1/areas" do
    example_request "List all areas" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "web_api/v1/areas/:id" do
    let(:id) {@areas.first.id}

    example_request "Get one area by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @areas.first.id
    end
  end
end
