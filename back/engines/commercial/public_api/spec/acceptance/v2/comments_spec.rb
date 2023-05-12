# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Comments' do
  explanation 'All comments on the platform'

  include_context 'common_auth'

  let!(:comments) { create_list(:comment, 5) }

  get '/api/v2/comments/' do
    route_summary 'Get all comments on the platform.'
    route_description 'Endpoint to retrieve all comments from the platform. The most recent comments are returned first. The endpoint supports pagination.'

    include_context 'common_list_params'

    context 'Unfiltered paged request' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:comments].size).to eq 2
        expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
      end
    end

    context 'Filtered by created_at' do
      let(:created_at) { '2022-05-01,2022-05-03' }

      before { comments[0].update(created_at: '2022-05-02') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:comments].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context 'Filtered by updated_at' do
      let(:updated_at) { ',2023-01-31' }

      before { comments[0].update(updated_at: '2023-01-01') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:comments].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  # TODO: Just comments against ideas
  # TODO: Comments against initiatives

  get '/api/v2/comments/:id' do
    route_summary 'Get a single topic by id.'
    route_description 'Endpoint to retrieve a single topic from the platform.'

    include_context 'common_item_params'

    let(:id) { comments[0].id }

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      body = comments[0][:body_multiloc]
      body['nl-NL'] = body.delete 'nl-BE'
      comments[0].update(body_multiloc: body)
    end

    context 'Default locale' do
      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:comment]).to include({ id: id })
      end
    end

    context 'Retrieving a different locale' do
      let(:locale) { 'nl-NL' }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:comment][:body]).to eq comments[0].body_multiloc['nl-NL']
      end
    end
  end

  get '/api/v2/ideas/comments/' do
    route_summary 'Get all comments for all ideas.'
    route_description 'Endpoint to retrieve all comments against ideas from the platform. The most recent comments are returned first. The endpoint supports pagination.'

    include_context 'common_list_params'

    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:comments].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end
end
