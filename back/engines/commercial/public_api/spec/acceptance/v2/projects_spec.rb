# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Projects' do
  explanation 'Projects are participation scopes defined by the city. They define a context and set time and input expectations towards the citizens, stimulating them to engage in a the scoped debate. Citizens can post ideas in projects.'

  include_context 'common_auth'

  let!(:projects) { create_list(:project, 5) }

  get '/api/v2/projects/' do
    route_summary 'Get a page of projects'
    route_description 'Endpoint to retrieve city projects. The newest projects are returned first. The endpoint supports pagination.'

    include_context 'common_list_params'

    let(:locale) { 'en' }
    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:projects].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end

  get '/api/v2/projects/:id' do
    route_summary 'Get a single project by id.'
    route_description 'Get one project by id.'

    include_context 'common_item_params'

    let(:locale) { 'en' }
    let(:id) { projects[0].id }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:project]).to include({ id: id })
    end
  end
end
