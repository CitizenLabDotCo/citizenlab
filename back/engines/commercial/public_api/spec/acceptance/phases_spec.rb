# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Phases' do
  before do
    api_token = PublicApi::ApiClient.create
    token = AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation 'Phases represent the steps in a timeline project. Only timeline projects have phases, continuous projects do not.'

  route '/api/v1/projects/:project_id/phases', 'Phases: Listing the phases of a project' do
    let!(:project) { create(:project_with_phases) }
    let(:project_id) { project.id }

    get 'Retrieve a list of project phases' do
      parameter :page_size, 'The maximum number of phases that should be returned in one response. Defaults to 12, max 24', required: false, type: 'integer'
      parameter :page_number, 'The page to return. Defaults to page 1', required: false, type: 'integer'

      example_request 'Get the first page of phases for the given project' do
        explanation 'Endpoint to retrieve project phases. The phases are returned in chronological order. The endpoint supports pagination.'
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:phases].size).to eq project.phases.count
        expect(json_response[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end

      example 'Get the second page of phases' do
        do_request('page_number' => 2, 'page_size' => 2)
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:phases].size).to eq 2
        expect(json_response[:meta]).to eq({ total_pages: 3, current_page: 2 })
      end
    end
  end

  route '/api/v1/phases/:id', 'Phases: Retrieving one project phase' do
    get 'Retrieve one phase by id' do
      let(:project) { create(:project_with_phases) }
      let(:phase) { project.phases.first }
      let(:id) { phase.id }

      example_request 'Get one phase by id' do
        expect(status).to eq(200)
        json_response = json_parse(response_body)
        expect(json_response[:phase]).to match({
          id: id,
          title: 'Idea phase',
          start_at: phase.start_at.to_s,
          end_at: phase.end_at.to_s
        })
      end
    end
  end
end
