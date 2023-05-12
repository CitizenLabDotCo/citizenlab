# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Phases' do
  explanation 'Phases represent the steps in a timeline project. Only timeline projects have phases, continuous projects do not.'

  include_context 'common_auth'

  let!(:project) { create(:project_with_phases) }

  get '/api/v2/phases/' do
    route_summary 'List all phases'
    route_description 'Endpoint to retrieve all phases across all projects. The phases are returned in reverse order of date created. The endpoint supports pagination.'

    include_context 'common_list_params'

    parameter :start_at, 'Date phase started - in format "YYYY-DD-MM" - to filter between two dates separate with comma', in: :query, required: false, type: 'string'
    parameter :end_at, 'Date phase ended - in format "YYYY-DD-MM" - to filter between two dates separate with comma', in: :query, required: false, type: 'string'

    context 'Unfiltered paged request' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:phases].size).to eq 2
        expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
      end
    end

    context 'Filtered by created_at' do
      let(:created_at) { '2022-05-01,2022-05-03' }

      before { project.phases[0].update(created_at: '2022-05-02') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:phases].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context 'Filtered by updated_at' do
      let(:updated_at) { ',2023-01-31' }

      before { project.phases[0].update(updated_at: '2023-01-01') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:phases].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context 'Filtered by start_at' do
      let(:start_at) { '2020-01-01,2020-01-31' }

      before { project.phases[0].update(start_at: '2020-01-20') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:phases].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  get '/api/v2/projects/:project_id/phases' do
    route_summary 'List all the phases of a project'
    route_description 'Endpoint to retrieve phases of a single project. The phases are returned in reverse order of date created. The endpoint supports pagination.'

    include_context 'common_list_params'

    context 'Phases per project' do
      let(:project_id) { project.id }

      example_request 'Successful response' do
        expect(status).to eq(200)
        expect(json_response_body[:phases].size).to eq 5
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  get '/api/v2/phases/:id' do
    route_summary 'Get a single phase by id.'
    route_description 'Get one phase by id.'

    include_context 'common_item_params'

    let(:id) { project.phases[0].id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      title = project.phases[0][:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      project.phases[0].update(title_multiloc: title)
    end

    context 'Default locale' do
      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:phase]).to include({ id: id })
      end
    end

    context 'Retrieving a different locale' do
      let(:locale) { 'nl-NL' }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:phase][:title]).to eq project.phases[0].title_multiloc['nl-NL']
      end
    end
  end
end
