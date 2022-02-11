require 'rails_helper'
require 'rspec_api_documentation/dsl'


resource "Idea Custom Fields" do

  explanation "Fields in idea forms which are customized by the city, scoped on the project level."

  before do
    header "Content-Type", "application/json"
  end

  get "web_api/v1/projects/:project_id/custom_fields/schema" do

    let(:project) { create(:project) }
    let(:project_id) { project.id }

    example_request "Get the react-jsonschema-form json schema and ui schema for the custom fields" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:json_schema_multiloc)).to be_present
      expect(json_response.dig(:ui_schema_multiloc)).to be_present
    end
  end

  get "web_api/v1/projects/:project_id/custom_fields/json_forms_schema" do

    let(:project) { create(:project) }
    let(:project_id) { project.id }

    example_request "Get the jsonforms.io json schema and ui schema for the custom fields" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:json_schema_multiloc)).to be_present
      expect(json_response.dig(:ui_schema_multiloc)).to be_present
    end
  end
end
