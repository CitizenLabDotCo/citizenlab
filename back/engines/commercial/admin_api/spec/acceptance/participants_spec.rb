# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Participant', admin_api: true do
  before do
    header 'Content-Type', 'application/json'
    header 'Authorization', ENV.fetch('ADMIN_API_TOKEN')
    Analytics::PopulateDimensionsService.populate_types
  end

  let(:project) { create(:project) }
  let!(:idea) { create(:idea, project: project) }
  let(:project_id) { project.id }

  get 'admin_api/projects/:project_id/participants_count' do
    example_request 'Returns the number of participants for the project' do
      expect(status).to eq 200
      expect(json_response_body).to eq({ count: 1 })
    end
  end
end
