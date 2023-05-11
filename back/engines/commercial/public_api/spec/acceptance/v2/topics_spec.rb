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

    context 'Unfiltered paged request' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:topics].size).to eq 2
        expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
      end
    end

    context 'Filtered by created_at' do
      let(:created_at) { '2022-05-01,2022-05-03' }

      before { topics[0].update(created_at: '2022-05-02') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:topics].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context 'Filtered by updated_at' do
      let(:updated_at) { ',2023-01-31' }

      before { topics[0].update(updated_at: '2023-01-01') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:topics].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  get '/api/v2/topics/:id' do
    route_summary 'Get a single topic by id.'
    route_description 'Endpoint to retrieve a single topic from the platform.'

    include_context 'common_item_params'

    let(:id) { topics[0].id }

    context 'Default locale' do
      example_request 'Successful response' do
        assert_status 200
        # TODO: Add test to be sure of default locale
        expect(json_response_body[:topic]).to include({ id: id })
      end
    end

    context 'Retrieving a different locale' do
      let(:locale) { 'nl-BE' }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:topic][:title]).to eq topics[0].title_multiloc['nl-BE']
      end
    end
  end
end
