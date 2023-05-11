# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Ideas' do
  explanation "Ideas are written inputs created by citizens. The endpoint returns ideas in the a descending 'trending' order, which means that the most relevant ideas at the moment of request will come out on top."

  include_context 'common_auth'

  before do
    @ideas = create_list(:idea, 5)
    @ideas.each do |idea|
      idea.update!(custom_field_values: { 'audience_size' => rand(101...4000), 'audience_type' => 'young people' })
    end
  end

  get '/api/v2/ideas/' do
    route_summary 'Get a page of ideas.'
    route_description 'Endpoint to retrieve citizen ideas. The most trending ideas are returned first. The endpoint supports pagination'

    include_context 'common_list_params'

    # TODO: Additional filters for ideas
    # folder_id
    # status
    # topic

    let(:locale) { 'en' }
    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:ideas].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end

  get '/api/v2/ideas/:id' do
    route_summary 'Get a single idea by id.'
    route_description 'Endpoint to retrieve a single idea.'

    include_context 'common_item_params'

    let(:locale) { 'en' }
    let(:id) { @ideas[0].id }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:idea]).to include({ id: id })
    end
  end
end
