require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Topics" do
  before do
    @topics = create_list(:topic, 5)
  end

  get "api/v1/topics" do
    example_request "List all topics" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "api/v1/topics/:id" do
    let(:id) {@topics.first.id}

    example_request "Get one topic by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @topics.first.id
    end
  end
end
