# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Email campaign deliveries' do
  explanation <<~DESC.squish
    TODO add description
  DESC

  include_context 'common_auth'

  let!(:email_campaign_deliveries) { create_list(:delivery, 5, campaign: create(:manual_campaign)) }

  get '/api/v2/email_campaign_deliveries/' do
    route_summary 'List email campaign deliveries'
    route_description <<~DESC.squish
      TODO add description
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of topics' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:email_campaign_deliveries].size).to eq(page_size)

        total_pages = (email_campaign_deliveries.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    # include_examples 'filtering_by_date', :email_campaign, :created_at
    #
    # # Temporarily disable acts_as_list callbacks because they modify the updated_at
    # # attribute and break the tests. We use `it_behaves_like` to include the tests
    # # in a nested context to limit the scope of the `around` block.
    # it_behaves_like 'filtering_by_date', :email_campaign, :updated_at do
    #   around do |example|
    #     EmailCampaigns::Campaign.acts_as_list_no_update { example.run }
    #   end
    # end
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
      binding.pry
    end
  end

  include_examples '/api/v2/.../deleted', :email_campaign_deliveries
end
