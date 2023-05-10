# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/support/shared'

resource 'Phases' do
  explanation 'Phases represent the steps in a timeline project. Only timeline projects have phases, continuous projects do not.'

  include_context 'common_auth'

  let(:project) { create(:project_with_phases) }

  get '/api/v1/:locale/projects/:project_id/phases', 'Phases: Listing the phases of a project' do
    route_summary 'Phases: Listing the phases of a project'
    route_description 'Endpoint to retrieve project phases. The phases are returned in chronological order. The endpoint supports pagination.'

    include_context 'common_list_params'

    let(:locale) { 'en' }
    let(:project_id) { project.id }
    let(:page_size) { 2 }

    example_request 'Successful response' do
      expect(status).to eq(200)
      expect(json_response_body[:phases].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end

  get '/api/v1/:locale/phases/:id' do
    route_summary 'Get a single phase by id.'
    route_description 'Get one phase by id.'

    include_context 'common_item_params'

    let(:locale) { 'en' }
    let(:id) { project.phases[0].id }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:phase]).to include({ id: id })
    end
  end

  # TODO: /api/v1/:locale/phases/
end
