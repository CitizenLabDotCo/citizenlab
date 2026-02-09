# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Idea Exposures' do
  explanation 'An idea exposure is representing a user seeing an idea in the ideation feed.'
  header 'Content-Type', 'application/json'

  let(:user) { create(:user) }

  before { header_token_for user }

  post 'web_api/v1/ideas/:id/exposures' do
    let(:project) { create(:single_phase_ideation_project) }
    let(:phase) { project.phases.first }
    let(:idea) { create(:idea, project: project, phases: [phase]) }
    let(:id) { idea.id }

    example_request 'Create an idea exposure' do
      expect(response_status).to eq 201
      expect(response_data[:attributes]).to include(
        created_at: kind_of(String)
      )
      expect(response_data[:relationships]).to include(
        idea: { data: { id: idea.id, type: 'idea' } },
        user: { data: { id: user.id, type: 'user' } },
        phase: { data: { id: phase.id, type: 'phase' } }
      )
    end
  end
end
