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
      campaign1 = create(:comment_on_your_idea_campaign)
      campaign2 = create(:comment_on_your_idea_campaign)
      create(:delivery, campaign: campaign1)
      create(:delivery, campaign: campaign1)
      create(:delivery, campaign: campaign2)
    end

    example 'count sent email deliveries' do
      do_request({
        query: {
          fact: 'email_delivery',
          aggregations: {
            all: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data.attributes).to eq([{ count: 4 }])
    end

    example 'count custom email deliveries' do
      do_request({
        query: {
          fact: 'email_delivery',
          filters: {
            automated: false
          },
          aggregations: {
            all: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data.attributes).to eq([{ count: 1 }])
    end

    example 'count email campaigns' do
      do_request({
        query: {
          fact: 'email_delivery',
          aggregations: {
            campaign_id: 'count'
          }
        }
      })

      assert_status 200
      expect(response_data.attributes).to eq([{ count_campaign_id: 3 }])
    end
  end
end
