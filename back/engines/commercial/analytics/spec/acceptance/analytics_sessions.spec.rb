# frozen_string_literal: true

# Tests for queries needed by the visitors dashboard

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - Sessions model' do
  explanation 'Queries to summarise session data from impact tracking module.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before do
      create_list(:session, 5)
    end

    example 'correct number of sessions, visitors and users' do
      do_request({
        query: {
          fact: 'session',
          aggregations: {
            all: 'count',
            monthly_user_hash: 'count'
          }
        }
      })
      assert_status 200

      expect(response_data[:attributes])
        .to contain_exactly({
          count: 5,
          count_monthly_user_hash: 1
        })
    end
  end
end
