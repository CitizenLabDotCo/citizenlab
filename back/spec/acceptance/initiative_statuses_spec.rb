require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "InitiativeStatuses" do

  explanation "Initivative statuses reflect the cities attitude towards an initiative."

  before do
    header "Content-Type", "application/json"
    @statuses = create_list(:initiative_status, 3)
  end

  get "web_api/v1/initiative_statuses" do
    example_request "List all initiative statuses" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].map{|d| d[:id]}).to match_array @statuses.map(&:id)
    end
  end

  get "web_api/v1/initiative_statuses/:id" do
    let(:id) { @statuses.first.id }

    example_request "Get one initiative status by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @statuses.first.id
    end
  end
end