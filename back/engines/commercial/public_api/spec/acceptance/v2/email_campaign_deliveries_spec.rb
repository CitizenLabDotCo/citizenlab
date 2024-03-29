# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Email Campaigns' do
  include_context 'common_auth'

  let!(:email_campaign_deliveries) { create_list(:delivery, 5, campaign: create(:manual_campaign)) }

  get '/api/v2/email_campaign_deliveries/' do
    route_summary 'List email campaign deliveries'
    route_description <<~DESC.squish
      List all the emails that have been sent out for all campaigns.
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of deliveries' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:email_campaign_deliveries].size).to eq(page_size)

        total_pages = (email_campaign_deliveries.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :delivery, :created_at, 'email_campaign_delivery'
    include_examples 'filtering_by_date', :delivery, :updated_at, 'email_campaign_delivery'
  end

  get '/api/v2/email_campaign_deliveries/:id' do
    route_summary 'Get an email campaign delivery'
    route_description 'Retrieve a single email campaign delivery by its ID.'

    include_context 'common_item_params'

    let(:email_campaign_delivery) { email_campaign_deliveries[0] }
    let(:id) { email_campaign_delivery.id }

    example_request 'Returns the delivery' do
      assert_status 200
      expect(json_response_body[:email_campaign_delivery]).to include({ id: id })
    end
  end

  include_examples '/api/v2/.../deleted', :email_campaign_deliveries
end
