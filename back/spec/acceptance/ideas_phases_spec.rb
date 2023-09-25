# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'IdeasPhases' do
  explanation 'An IdeasPhase represents that an idea belongs to a phase. If this phase is a voting phase, the number of votes and baskets is also stored in the IdeasPhase.'

  before do
    header 'Content-Type', 'application/json'
    @project = create(:project_with_active_ideation_phase)
    @phase = @project.phases.first
    @idea = create(:idea, phases: [@phase], project: @project)
    @ideas_phase = @idea.ideas_phases.first
  end

  context 'when not logged in' do
    get 'web_api/v1/ideas_phases/:id' do
      let(:id) { @ideas_phase.id }

      example_request 'Get one ideas_phase by id' do
        expect(status).to eq 401
      end
    end
  end

  context 'when logged in as an admin' do
    before do
      admin_header_token
    end

    get 'web_api/v1/ideas_phases/:id' do
      let(:id) { @ideas_phase.id }

      example_request 'Get one ideas_phase by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @ideas_phase.id
      end
    end
  end

  context 'when logged in as a project moderator' do
    before do
      header_token_for(create(:user, roles: [{ 'type' => 'project_moderator', 'project_id' => @project.id }]))
    end

    get 'web_api/v1/ideas_phases/:id' do
      let(:id) { @ideas_phase.id }

      example_request 'Get one ideas_phase by id' do
        expect(status).to eq 200
        json_response = json_parse(response_body)
        expect(json_response.dig(:data, :id)).to eq @ideas_phase.id
      end
    end
  end
end
