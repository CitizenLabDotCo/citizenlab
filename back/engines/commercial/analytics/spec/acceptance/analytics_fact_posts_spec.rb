# frozen_string_literal: true

# Specific tests for the fact_posts view

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Fact posts', use_transactional_fixtures: false do
  before { header 'Content-Type', 'application/json' }

  post 'web_api/v1/analytics' do
    with_options required: true do
      parameter :query, 'The query object.'
    end

    before do
      create_list(:idea, 5) # Create 5 ideas
      create(:dimension_type) # Create the 'idea' type
    end

    context 'When admin' do
      before do
        admin_header_token
      end

      example 'Makes a successful basic query that follows limits and returns correct fields' do
        do_request(query: { fact: 'post', limit: 3 })

        # Success
        assert_status 200

        # Correct number returned
        data = json_response_body[:data]
        expect(data.length).to eq(3)

        # Correct keys are returned
        data.each do |record|
          expect(record.keys).to match_array(%i[
            id
            user_id
            project_id
            type_id
            created_date
            feedback_first_date
            feedback_time_taken
            feedback_official
            feedback_status_change
            feedback_none
            votes_count
            upvotes_count
            downvotes_count
          ])
        end
      end
    end
  end
end
