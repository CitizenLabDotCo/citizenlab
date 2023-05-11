# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Topics' do
  explanation 'All topics created in the platform'

  include_context 'common_auth'

  let!(:topics) { create_list(:topic, 5) }

  get '/api/v2/topics/' do
    route_summary 'Get a page of topics.'
    route_description 'Endpoint to retrieve all topics from the platform. The most recent topics are returned first. The endpoint supports pagination.'

    include_context 'common_list_params'

    let(:locale) { 'en' }
    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:topics].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end

  get '/api/v2/topics/:id' do
    route_summary 'Get a single topic by id.'
    route_description 'Endpoint to retrieve a single topic from the platform.'

    include_context 'common_item_params'

    let(:locale) { 'en' }
    let(:id) { topics[0].id }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:topic]).to include({ id: id })
    end
  end
end
