require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Phase", admin_api: true do

  before do
    header "Content-Type", "application/json"
    header 'Authorization', ENV.fetch("ADMIN_API_TOKEN")
  end

  let(:project) { create(:project_with_phases) }
  let(:project_id) { project.id }

  get "admin_api/projects/:project_id/phases" do
    example_request "List all phases in a project" do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response.size).to eq project.phases.size
    end
  end

end