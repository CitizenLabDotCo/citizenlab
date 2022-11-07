# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Analytics - FactEmailDeliveries model' do
  explanation 'Queries to summarise email deliveries.'

  before do
    header 'Content-Type', 'application/json'
    admin_header_token
  end

  post 'web_api/v1/analytics' do
    before_all do
      create(:delivery)
      create(:delivery, campaign: create(:comment_on_your_idea_campaign))
    end

    example 'count sent email deliveries' do
      do_request({
        query: {
          fact: 'email_delivery',
          filters: {
            sent: true
          },
          aggregations: {
            all: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data).to eq([{ count: 2 }])
    end

    example 'count automated email deliveries' do
      do_request({
        query: {
          fact: 'email_delivery',
          filters: {
            automated: true
          },
          aggregations: {
            all: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data).to eq([{ count: 1 }])
    end
  end
end
