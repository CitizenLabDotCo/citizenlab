# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/support/shared'

resource 'Projects' do
  before do
    create_list(:project, 5)
    api_token = PublicApi::ApiClient.create
    token = Knock::AuthToken.new(payload: api_token.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  explanation 'Projects are participation scopes defined by the city. They define a context and set time and input expectations towards the citizens, stimulating them to engage in a the scoped debate. Citizens can post ideas in projects.'

  include_context 'common_parameters'

  get '/api/v1/:locale/projects/' do
    let(:locale) { 'en' }
    let(:page_size) { 2 }

    example_request 'Get a page of projects' do
      explanation 'Endpoint to retrieve city projects. The newest projects are returned first. The endpoint supports pagination.'
      assert_status 200

      pp json_response_body

      expect(json_response_body[:projects].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end
end
