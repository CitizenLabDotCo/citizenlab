# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Posts' do
  # NOTE: Same name as in initiatives_spec to combine the documentation into the same section
  explanation 'Posts are written inputs created by citizens - These could be ideas, initiatives (proposals) or survey responses'

  include_context 'common_auth'

  before do
    @ideas = create_list(:idea, 5)
    @ideas.each do |idea|
      idea.update!(custom_field_values: { 'audience_size' => rand(101...4000), 'audience_type' => 'young people' })
    end
  end

  # TODO: How do we get the format etc of response fields out into the spec? This doesn't seem to work
  response_field :created_at, 'Date the resource was created at'

  get '/api/v2/ideas/' do
    route_summary 'Get a page of ideas.'
    route_description 'Endpoint to retrieve citizen ideas. The most recent ideas are returned first. The endpoint supports pagination'

    include_context 'common_list_params'

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

    before do
      # NOTE: Temp fix until locales of factories and tenants are consistent
      title = @ideas[0][:title_multiloc]
      title['nl-NL'] = title.delete 'nl-BE'
      @ideas[0].update(title_multiloc: title)
    end

    context 'Unfiltered' do
      example_request 'Successful response' do
        assert_status 200
        expect(json_response_body[:idea]).to include({ id: id })
      end
    end

    context 'Retrieving a different locale' do
      let(:locale) { 'nl-NL' }

      example_request 'Successful response', document: false do
        assert_status 200
        expect(json_response_body[:idea][:title]).to eq @ideas[0].title_multiloc['nl-NL']
      end
    end
  end
end
