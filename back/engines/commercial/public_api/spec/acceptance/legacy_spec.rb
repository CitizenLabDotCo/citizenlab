# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Legacy' do
  before do
    api_token = PublicApi::ApiClient.create
    token = Knock::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation 'Deprecated endpoints that are still available if required.'

  context 'Ideas', document: false do
    before do
      @ideas = create_list(:idea, 5)
    end

    route '/api/v1/ideas', 'Ideas: Listing ideas' do
      get 'Retrieve a listing of ideas' do
        parameter :page_size, 'The number of ideas that should be returned in one response. Defaults to 12, max 24', required: false, type: 'integer'
        parameter :page_number, 'The page to return. Defaults to page 1', required: false, type: 'integer'

        example_request 'Get the first page of trending ideas' do
          explanation 'Endpoint to retrieve citizen ideas. The most trending ideas are returned first. The endpoint supports pagination.'
          assert_status 200
          json_response = json_parse(response_body)

          expect(json_response[:ideas].size).to eq 5
          expect(json_response[:meta]).to eq({ total_pages: 1, current_page: 1 })
        end

        example 'Native survey responses are not included' do
          IdeaStatus.create_defaults
          create(:idea, project: create(:continuous_native_survey_project))

          do_request

          assert_status 200
          json_response = json_parse response_body
          expect(json_response[:ideas].size).to eq 5
        end

        example 'Get the second page of trending ideas' do
          do_request('page_number' => 2, 'page_size' => 3)
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:ideas].size).to eq 2
          expect(json_response[:meta]).to eq({ total_pages: 2, current_page: 2 })
        end
      end
    end

    route '/api/v1/ideas/:idea_id', 'Ideas: Retrieve one idea' do
      parameter :idea_id, 'The unique ID identifying the idea', type: 'string', required: true

      get 'Retrieve one idea' do
        let(:idea_id) { @ideas.first.id }

        example_request 'Get one idea by id' do
          assert_status 200
          json_response = json_parse(response_body)
          expect(json_response[:idea][:id]).to eq idea_id
        end
      end
    end
  end

  context 'Projects', document: false do
    route '/api/v1/projects', 'Projects: Listing projects' do
      let!(:projects) { create_list(:project, 5) }

      get 'Retrieve a listing of projects' do
        parameter :page_size, 'The number of projects that should be returned in one response. Defaults to 12, max 24', required: false, type: 'integer'
        parameter :page_number, 'The page to return. Defaults to page 1', required: false, type: 'integer'

        example_request 'Get the first page of projects' do
          explanation 'Endpoint to retrieve city projects. The newest projects are returned first. The endpoint supports pagination.'
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:projects].size).to eq Project.count
          expect(json_response[:meta]).to eq({ total_pages: 1, current_page: 1 })
        end

        example 'Get the second page of projects' do
          do_request('page_number' => 2, 'page_size' => 3)
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:projects].size).to eq 2
          expect(json_response[:meta]).to eq({ total_pages: 2, current_page: 2 })
        end
      end
    end

    route '/api/v1/projects/:id', 'Projects: Retrieve one project' do
      get 'Retrieve one project' do
        let(:project) { create(:project) }
        let!(:map_config) { create(:map_config, :with_positioning, project: project) }
        let(:id) { project.id }

        example_request 'Get one project by id' do
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:project]).to include(
            id: id,
            title: 'Renew West Parc',
            description_html: '<p>Let\'s renew the parc at the city border and make it an enjoyable place for young and old.</p>',
            description_preview: 'Let\'s renew the parc at the city border and make it an enjoyable place for young and old.',
            map_center_geojson: { coordinates: [an_instance_of(Float), an_instance_of(Float)], type: 'Point' },
            href: "http://example.org/projects/#{project.slug}",
            ideas_count: 0,
            images: []
          )
        end

        example 'Get one project by id without a map configuration', document: false do
          project.update!(map_config: nil)
          do_request
          expect(status).to eq(200)
          json_response = json_parse(response_body)
          expect(json_response[:project]).to include(
            map_center_geojson: nil
          )
        end
      end
    end
  end

  context 'Phases', document: false do
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
          expect(json_response[:phase]).to include({
            id: id,
            title: 'Idea phase',
            start_at: phase.start_at.to_s,
            end_at: phase.end_at.to_s
          })
        end
      end
    end
  end
end
