require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Topics" do

  explanation "E.g. mobility, health, culture..."

  before do
    @topics = create_list(:topic, 5)
  end

  get "web_api/v1/topics" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of topics per page"
    end
    
    example_request "List all topics" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "web_api/v1/topics/:id" do
    let(:id) {@topics.first.id}

    example_request "Get one topic by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @topics.first.id
    end
  end
end
