require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "IdeaStatuses" do

  before do
    header "Content-Type", "application/json"
    @statuses = create_list(:idea_status, 3)
  end

  get "api/v1/idea_statuses" do
    example_request "List the available idea statuses for the tenant" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 3
      expect(json_response[:data].first[:id]).to eq @statuses.first.id
    end
  end

  get "api/v1/idea_statuses/:id" do
    let(:id) { @statuses.first.id }

    example_request "Get metadata of one idea status" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @statuses.first.id
    end
  end


end