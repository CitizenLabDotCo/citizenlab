# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Voting' do
  explanation <<~DESC.squish
    When a user votes for an idea, a `basket` is created per user for the project or phase. 
    An association is then created between the basket and the idea voted for and stored with the number of votes.
    Votes are not counted unless the basket has been submitted.
  DESC

  include_context 'common_auth'

  let!(:baskets) { create_list(:basket, 5) }

  get '/api/v2/baskets' do
    route_summary 'List all baskets'
    route_description <<~DESC.squish
      A user will get a single basket per voting phase or project. Votes (stored in basket ideas) remain uncounted
      until the basket is submitted and there is a `submitted_at` date within the basket
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of topics' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:baskets].size).to eq(page_size)
        expect(json_response_body[:baskets].first.keys).to match_array(%i[id user_id project_id phase_id submitted_at created_at updated_at])

        total_pages = (baskets.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :basket, :created_at
    include_examples 'filtering_by_date', :basket, :updated_at
  end

  get '/api/v2/baskets/:id' do
    route_summary 'Get a single basket'
    route_description 'Retrieve a single basket by its ID.'

    include_context 'common_item_params'

    let(:id) { baskets.first.id }

    example_request 'Returns the basket' do
      assert_status 200
      expect(json_response_body[:basket]).to include({ id: id })
    end
  end

  include_examples '/api/v2/.../deleted', :baskets
end
