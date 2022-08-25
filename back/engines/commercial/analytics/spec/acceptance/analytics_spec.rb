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

    with_options required: true do
      parameter :query, 'The query object.'
    end

    before do
      create(:idea) # Create one idea
      create(:dimension_type) # Create the 'idea' type
    end

    context 'When admin' do
      before do
        admin_header_token
      end

      example 'Checks that query must contain the "fact" property' do
        do_request(query: {})
        messages = json_response_body[:messages]
        assert_status 400
        expect(messages.length).to eq(1)
        expect(messages[0]).to include("did not contain a required property of 'fact'")
      end

      example 'Checks that fact name must be valid' do
        do_request(query: { fact: 'none' })
        assert_status 400
      end

    end

    context 'When not admin' do
      example_request 'Checks that analytics API cannot be called if not logged in' do
        assert_status 401
      end
    end
  end
end
