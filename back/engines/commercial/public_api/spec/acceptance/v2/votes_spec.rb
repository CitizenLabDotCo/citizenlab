# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Votes' do
  explanation 'All votes created in the platform'

  include_context 'common_auth'

  get '/api/v2/ideas/votes/' do
    route_summary 'Get a page of votes against ideas.'
    route_description 'Endpoint to retrieve all votes from the platform. The most recent votes are returned first. The endpoint supports pagination.'

    let!(:votes) { create_list(:vote, 5) }

    include_context 'common_list_params'

    context 'Unfiltered paged request' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq 2
        expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
      end
    end

    context 'Filtered by created_at' do
      let(:created_at) { '2022-05-01,2022-05-03' }

      before { votes[0].update(created_at: '2022-05-02') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:votes].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context 'Filtered by updated_at' do
      let(:updated_at) { ',2023-01-31' }

      before { votes[0].update(updated_at: '2023-01-01') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:votes].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  get '/api/v2/ideas/comments/votes/' do
    route_summary 'Get a page of votes against idea comments.'
    route_description 'Endpoint to retrieve all votes from the platform. The most recent votes are returned first. The endpoint supports pagination.'

    let!(:votes) { create_list(:comment_vote, 5) }

    include_context 'common_list_params'

    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:votes].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end

  get '/api/v2/initiatives/votes/' do
    route_summary 'Get a page of votes against initiatives.'
    route_description 'Endpoint to retrieve all votes from the platform. The most recent votes are returned first. The endpoint supports pagination.'

    let!(:votes) { create_list(:vote, 5, votable: create(:initiative)) }

    include_context 'common_list_params'

    context 'Unfiltered paged request' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:votes].size).to eq 2
        expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
      end
    end
  end

  get '/api/v2/initiatives/comments/votes/' do
    route_summary 'Get a page of votes against initiative comments.'
    route_description 'Endpoint to retrieve all votes from the platform. The most recent votes are returned first. The endpoint supports pagination.'

    let!(:votes) { create_list(:comment_vote, 5, votable: create(:comment, post: create(:initiative))) }

    include_context 'common_list_params'

    let(:page_size) { 2 }

    example_request 'Successful response' do
      assert_status 200
      expect(json_response_body[:votes].size).to eq 2
      expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
    end
  end
end
