# frozen_string_literal: true

# Tests for the generic API - testing high level validation

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics API', use_transactional_fixtures: false do
  explanation 'Analytics API'

  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/analytics' do
    route_description <<~DESC
      Universal API for querying posts from the analytics database
    DESC

    parameter :query, 'The query object.', required: true

    before do
      create(:idea)
      create(:dimension_type_idea)
    end

    context 'when admin' do
      before do
        admin_header_token
      end

      example 'handles single query' do
        do_request(query: {
          fact: 'post',
          aggregations: { all: 'count' }
        })
        assert_status 200
        expect(response_data).to eq([{ count: 1 }])
      end

      example 'handles multiple queries' do
        query = {
          fact: 'post',
          aggregations: { all: 'count' }
        }
        do_request(query: [query, query])
        assert_status 200
        expect(response_data).to eq([[{ count: 1 }], [{ count: 1 }]])
      end

      example 'handles error in query' do
        query = {
          fact: 'post',
          aggregations: { all: 'max' }
        }
        do_request(query: query)
        assert_status 400
        expect(json_response_body[:messages]).to eq(["Aggregations on 'all' can only be 'count'."])
      end

      example 'rejects non-existent dimensions' do
        query = {
          fact: 'post',
          groups: 'dimension_non_existent.id',
          aggregations: { all: 'count' }
        }
        do_request(query: query)
        assert_status 400
        expect(json_response_body[:messages]).to eq(['Groups field dimension_non_existent does not exist.'])
      end
    end

    context 'When not admin' do
      example_request 'returns 401 (unauthorized)' do
        assert_status 401
      end
    end
  end
end
