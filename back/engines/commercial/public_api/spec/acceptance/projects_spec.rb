# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Projects' do
  before do
    api_token = PublicApi::ApiClient.create
    token = AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation 'Projects are participation scopes defined by the city. They define a context and set time and input expectations towards the citizens, stimulating them to engage in a the scoped debate. Citizens can post ideas in projects.'

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
        expect(json_response[:project]).to match({
          id: id,
          title: 'Renew West Parc',
          description_html: '<p>Let\'s renew the parc at the city border and make it an enjoyable place for young and old.</p>',
          description_preview: 'Let\'s renew the parc at the city border and make it an enjoyable place for young and old.',
          map_center_geojson: { coordinates: [an_instance_of(Float), an_instance_of(Float)], type: 'Point' },
          href: "http://example.org/projects/#{project.slug}",
          ideas_count: 0,
          images: []
        })
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
