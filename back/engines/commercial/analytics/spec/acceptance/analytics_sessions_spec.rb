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

    example 'exclude sessions of admins and moderators' do
      create(:session, user_id: create(:user).id)
      create_admins_and_moderators.each { |user| create(:session, user_id: user.id) }

      enable_exclude_admins_and_moderators_from_statistics
      do_request({
        query: {
          fact: 'session',
          aggregations: {
            all: 'count'
          }
        }
      })
      assert_status 200
      expect(response_data[:attributes]).to contain_exactly({ count: 6 }) # 5 anonymous sessions and 1 of a citizen
    end
  end
end
