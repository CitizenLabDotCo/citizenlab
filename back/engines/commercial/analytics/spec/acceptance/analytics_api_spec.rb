# frozen_string_literal: true

# Tests for the generic API - testing high level validation

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics', use_transactional_fixtures: false do
  explanation 'Core functionality of the Analytics API'

  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/analytics' do
    parameter :query, 'The query object.', required: true

    let(:date) { Date.new(2022, 9, 1) }

    before do
      create(:dimension_date, date: date)
      create(:idea, created_at: date)
      create(:dimension_type)
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
        expect(response_data[:attributes]).to eq([{ count: 1 }])
      end

      example 'handles multiple queries' do
        query = {
          fact: 'post',
          aggregations: { all: 'count' }
        }
        do_request(query: [query, query])
        assert_status 200
        expect(response_data[:attributes]).to eq([[{ count: 1 }], [{ count: 1 }]])
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
        expect(json_response_body[:messages]).to eq(['Groups field dimension_non_existent.id does not exist.'])
      end

      example 'returns one page pagination' do
        query = {
          fact: 'post',
          aggregations: { all: 'count' }
        }
        expected_pagination = 'http://example.org/web_api/v1/analytics?query%5Baggregations%5D%5Ball%5D=count&query%5Bfact%5D=post&query%5Bpage%5D%5Bnumber%5D=1'
        do_request(query: query)

        assert_status 200
        expect(json_response_body[:links][:first]).to eq(expected_pagination)
        expect(json_response_body[:links][:last]).to eq(expected_pagination)
        expect(json_response_body[:links][:next]).to be_nil
        expect(json_response_body[:links][:prev]).to be_nil
        expect(json_response_body[:links][:self]).to eq(expected_pagination)
      end

      context 'when filtering by date' do
        example 'returns data if it gets into date range' do
          query = {
            fact: 'post',
            filters: {
              'dimension_date_created.date': {
                from: date - 1.day
              }
            },
            aggregations: { all: 'count' }
          }
          do_request(query: query)
          assert_status 200
          expect(response_data[:attributes]).to eq([{ count: 1 }])
        end

        example 'returns no data if it does not get into date range' do
          query = {
            fact: 'post',
            filters: {
              'dimension_date_created.date': {
                from: date + 1.day
              }
            },
            aggregations: { all: 'count' }
          }
          do_request(query: query)
          assert_status 200
          expect(response_data[:attributes]).to eq([{ count: 0 }])
        end
      end
    end

    context 'When not admin' do
      example_request 'returns 401 (unauthorized)' do
        assert_status 401
      end
    end

    context 'when moderator' do
      before do
        @project = create(:project)
        @moderator = create(:project_moderator, projects: [@project])
        header_token_for @moderator
      end

      example 'handles single query' do
        do_request(query: {
          fact: 'post',
          aggregations: { all: 'count' }
        })
        assert_status 200
        expect(response_data[:attributes]).to eq([{ count: 1 }])
      end
    end
  end
end
