# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Phases' do
  explanation <<~DESC.squish
    Phases represent the steps in a timeline project. Only timeline projects have phases,
    continuous projects do not.
  DESC

  include_context 'common_auth'

  let!(:project) { create(:project_with_phases) }

  get '/api/v2/phases/' do
    route_summary 'List phases'
    route_description <<~DESC.squish
      Retrieve a paginated list of all the phases in the platform, with the most recently 
      created ones first.
    DESC

    include_context 'common_list_params'

    parameter(
      :start_at,
      <<~DESC.squish,
        List only phases whose start date lies in the specified range. The range is
        specified as two dates separated by a comma: `YYYY-MM-DD,YYYY-MM-DD`. Open-ended
        ranges are also supported: `YYYY-MM-DD,` or `,YYYY-MM-DD`.
      DESC
      in: :query,
      required: false,
      type: :string
    )

    parameter(
      :end_at,
      <<~DESC.squish,
        List only phases whose end date lies in the specified range. The range is
        specified as two dates separated by a comma: `YYYY-MM-DD,YYYY-MM-DD`. Open-ended
        ranges are also supported: `YYYY-MM-DD,` or `,YYYY-MM-DD`.
      DESC
      in: :query,
      required: false,
      type: :string
    )

    context 'when the page size is smaller than the total number of phases' do
      let(:page_size) { 2 }

      example_request 'List only the first page of phases', document: false do
        assert_status 200
        expect(json_response_body[:phases].size).to eq(page_size)

        total_pages = (project.phases.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :phase, :created_at
    include_examples 'filtering_by_date', :phase, :updated_at
    include_examples 'filtering_by_date', :phase, :start_at
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
    route_summary 'Get phase'
    route_description 'Retrieve a single phase by its ID.'

    include_context 'common_item_params'

    let(:phase) { project.phases[0] }
    let(:id) { phase.id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      # Currently, the tenant locales are ["en", "fr-FR", "nl-NL"], while the factory
      # locales are ["en", "nl-BE"]. The following code aligns the two by replacing
      # the "nl-BE" locale with "nl-NL" in the phase.
      title = phase[:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      phase.update!(title_multiloc: title)
    end

    example_request 'Returns the phase in the default locale' do
      assert_status 200
      expect(json_response_body[:phase]).to include({ id: id })
    end

    context 'when requesting the phase in a specific locale' do
      let(:locale) { 'nl-NL' }

      example_request 'Returns the phase in the specified locale', document: false do
        assert_status 200
        expect(json_response_body.dig(:phase, :title))
          .to eq phase.title_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :phases
end
