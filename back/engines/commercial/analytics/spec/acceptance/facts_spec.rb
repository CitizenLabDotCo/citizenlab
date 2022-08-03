# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Posts' do
  explanation 'Analytics API'

  before { header 'Content-Type', 'application/json' }

  let(:json_response) { json_parse(response_body) }

  post 'web_api/v1/analytics/posts' do
    route_description <<~DESC
      Universal API for querying posts from the analytics database
    DESC

    with_options required: true do
      parameter :query, 'The query object.'
    end

    context 'when admin' do
      before { admin_header_token }

      let(:query) do
        {
          dimensions: {
            type: {
              name: 'idea'
            }
          }
        }
      end
      let(:expected_response) do
        [
          {
            sum_votes_count: 470,
            'type.name': 'idea'
          },
          {
            sum_votes_count: 156,
            'type.name': 'initiative'
          }
        ]
      end

      example_request 'makes a query' do
        expect(status).to eq(200)
        expect(json_response).to match(expected_response)
      end
    end
  end
end
