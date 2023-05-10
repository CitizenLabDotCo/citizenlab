# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/support/shared'

resource 'Phases' do
  before do
    api_token = PublicApi::ApiClient.create
    token = Knock::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  let(:project) { create(:project_with_phases) }

  explanation 'Phases represent the steps in a timeline project. Only timeline projects have phases, continuous projects do not.'

  include_context 'common_parameters'

  # TODO: /api/v1/:locale/phases/
  # TODO: /api/v1/:locale/phases/:id

  get '/api/v1/:locale/projects/:project_id/phases', 'Phases: Listing the phases of a project' do
    route_summary 'Phases: Listing the phases of a project'
    route_description 'Endpoint to retrieve project phases. The phases are returned in chronological order. The endpoint supports pagination.'

    let(:locale) { 'en' }
    let(:project_id) { project.id }
    let(:page_size) { 2 }

    example_request 'Successful response' do
      expect(status).to eq(200)
      expect(json_response_body[:phases].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end
end
