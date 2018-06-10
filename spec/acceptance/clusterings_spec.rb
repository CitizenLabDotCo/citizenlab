require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Clusterings" do
 
  explanation "A clustering is a specific hierarchical classification of ideas, used for analysis"

  before do
    @admin = create(:admin)
    token = Knock::AuthToken.new(payload: { sub: @admin.id }).token
    header 'Authorization', "Bearer #{token}"
    header "Content-Type", "application/json"
    @clusterings = create_list(:clustering, 5)
  end

  get "web_api/v1/clusterings" do
    with_options scope: :page do
      parameter :number, "Page number"
      parameter :size, "Number of clusterings per page"
    end
    example_request "List all clusterings" do
      expect(status).to eq(200)
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end
  end

  get "web_api/v1/clusterings/:id" do
    let(:id) {@clusterings.first.id}

    example_request "Get one clustering by id" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq @clusterings.first.id
    end
  end

  post "web_api/v1/clusterings" do
    with_options scope: :clustering do
      parameter :title_multiloc, "The title of the clustering, as a multiloc string", required: true
      parameter :levels, "An array composed of keywords 'project' and 'topic' that defines how to cluster initially", required: true
    end
    ValidationErrorHelper.new.error_fields(self, Clustering)

    let(:clustering) { build(:clustering) }
    let(:title_multiloc) { clustering.title_multiloc }
    let(:levels) {['project', 'topic']}

    example_request "Create a clustering" do
      expect(response_status).to eq 201
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
    end
  end

  patch "web_api/v1/clusterings/:id" do
    with_options scope: :clustering do
      parameter :title_multiloc, "The title of the clustering, as a multiloc string"
      parameter :structure, "The whole clustering definition. Should comply to following JSON schema: #{Clustering::STRUCTURE_JSON_SCHEMA}", required: false
    end
    ValidationErrorHelper.new.error_fields(self, Clustering)

    let(:clustering) { create(:clustering) }
    let(:id) { clustering.id }
    let(:title_multiloc) { {'en' => "Ideas by domain expert"} }
    let(:structure) {{
      "type" => "custom",
      "id" => "633c4eb6-79b0-4f36-9964-fe4cdb35e472",
      "title" => "Some title we have here!",
      "children" => []
    }}

    example_request "Update a clustering" do
      expect(response_status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data,:attributes,:title_multiloc).stringify_keys).to match title_multiloc
      expect(json_response.dig(:data,:attributes,:structure,:id)).to match "633c4eb6-79b0-4f36-9964-fe4cdb35e472"
    end
  end

  delete "web_api/v1/clusterings/:id" do
    let!(:id) { create(:clustering).id }

    example "Delete a clustering" do
      old_count = Clustering.count
      do_request
      expect(response_status).to eq 200
      expect{Clustering.find(id)}.to raise_error(ActiveRecord::RecordNotFound)
      expect(Clustering.count).to eq (old_count - 1)
    end
  end
end
