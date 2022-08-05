# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Posts', use_transactional_fixtures: false do
  explanation 'Analytics API'

  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/analytics' do
    route_description <<~DESC
      Universal API for querying posts from the analytics database
    DESC

    with_options required: true do
      parameter :query, 'The query object.'
    end

    context 'when admin' do
      before do
        admin_header_token
        create :idea
      end

      let(:query) { { fact: 'post' } }

      let(:expected_response) { { } }

      example_request 'makes a query' do
        # binding.pry
        puts query
        puts json_response
        expect(status).to eq(200)
        expect(json_response_body).to match(expected_response)
      end
    end
  end
end
