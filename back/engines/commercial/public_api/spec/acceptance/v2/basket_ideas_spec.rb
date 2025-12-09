# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Voting' do
  include_context 'common_auth'

  parameter(
    :idea_id,
    'Filter by idea ID',
    required: false,
    type: :string,
    in: :query
  )

  parameter(
    :basket_id,
    'Filter by basket ID',
    required: false,
    type: :string,
    in: :query
  )

  get '/api/v2/basket_ideas' do
    route_summary 'List associations between baskets and ideas'
    route_description <<~DESC.squish
      Basket idea associations define which ideas a user has voted for. 
      The `votes` field defines how many votes a user has given to the idea 
      or in the case of budgeting projects/phases, how much budget they have allocated.
    DESC

    include_context 'common_list_params'

    let!(:basket_ideas) { create_list(:baskets_idea, 5) }

    example_request 'List all associations between baskets and ideas' do
      assert_status 200
      associations = json_response_body[:basket_ideas].map { |bi| [bi[:basket_id], bi[:idea_id]] }
      expected_associations = basket_ideas.map { |bi| [bi.basket_id, bi.idea_id] }
      expect(associations).to match_array(expected_associations)
      expect(json_response_body[:basket_ideas].first.keys).to match_array(%i[id basket_id idea_id phase_id project_id user_id votes created_at updated_at])
    end

    describe 'when filtering by idea ID' do
      let(:idea_id) { basket_ideas.first.idea_id }

      example_request 'List only basket-idea associations for the specified idea', document: false do
        assert_status 200
        expect(json_response_body[:basket_ideas].pluck(:basket_id)).to contain_exactly(basket_ideas.first[:basket_id])
      end
    end

    describe 'when filtering by basket ID' do
      let(:basket_id) { basket_ideas.first.basket_id }

      example_request 'List only basket-idea associations for the specified basket', document: false do
        assert_status 200
        expect(json_response_body[:basket_ideas].pluck(:idea_id)).to contain_exactly(basket_ideas.first[:idea_id])
      end
    end
  end

  include_examples '/api/v2/.../deleted', :basket_ideas
end
