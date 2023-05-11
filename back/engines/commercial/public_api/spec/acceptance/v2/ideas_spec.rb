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

  response_field :created_at, 'Date the resource was created at'

  get '/api/v2/ideas/' do
    route_summary 'Get a page of ideas.'
    route_description 'Endpoint to retrieve citizen ideas. The most trending ideas are returned first. The endpoint supports pagination'

    include_context 'common_list_params'

    # TODO: Additional filters for ideas
    # folder_id
    # status
    # topic

    context 'Unfiltered paged request' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq 2
        expect(json_response_body[:meta]).to eq({ total_pages: 3, current_page: 1 })
      end
    end

    context 'Filtered by created_at' do
      let(:created_at) { '2022-05-01,2022-05-03' }

      before { @ideas[0].update(created_at: '2022-05-02') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end

    context 'Filtered by updated_at' do
      let(:updated_at) { ',2023-01-31' }

      before { @ideas[0].update(updated_at: '2023-01-01') }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:ideas].size).to eq 1
        expect(json_response_body[:meta]).to eq({ total_pages: 1, current_page: 1 })
      end
    end
  end

  get '/api/v2/ideas/:id' do
    route_summary 'Get a single idea by id.'
    route_description 'Endpoint to retrieve a single idea.'

    include_context 'common_item_params'

    let(:id) { @ideas[0].id }

    context 'Unfiltered' do
      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:idea]).to include({ id: id })
      end
    end

    context 'Retrieving a different locale' do
      let(:locale) { 'nl-BE' }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:idea][:title]).to eq @ideas[0].title_multiloc['nl-BE']
      end
    end
  end
end
