# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'
require './engines/commercial/public_api/spec/acceptance/v2/support/shared'

resource 'Email Campaigns' do
  explanation <<~DESC.squish
    Emails campaigns are created to send emails out to users of the platform.
  DESC

  include_context 'common_auth'

  let!(:email_campaigns) { create_list(:manual_campaign, 5) }

  get '/api/v2/email_campaigns/' do
    route_summary 'List email campaigns'
    route_description <<~DESC.squish
      List all manually created emails campaigns
    DESC

    include_context 'common_list_params'

    context 'when the page size is smaller than the total number of topics' do
      let(:page_size) { 2 }

      example_request 'Successful response' do
        assert_status 200

        expect(json_response_body[:email_campaigns].size).to eq(page_size)

        total_pages = (email_campaigns.size.to_f / page_size).ceil
        expect(json_response_body[:meta]).to eq({ total_pages: total_pages, current_page: 1 })
      end
    end

    include_examples 'filtering_by_date', :manual_campaign, :created_at, 'email_campaign'
    include_examples 'filtering_by_date', :manual_campaign, :updated_at, 'email_campaign'
  end

  get '/api/v2/email_campaigns/:id' do
    route_summary 'Get an email campaign'
    route_description 'Retrieve a single email campaign by its ID.'

    include_context 'common_item_params'

    let(:email_campaign) { email_campaigns[0] }
    let(:id) { email_campaign.id }

    example_request 'Returns the campaign in the default locale' do
      assert_status 200
      expect(json_response_body[:email_campaign]).to include({ id: id })
      expect(json_response_body.dig(:email_campaign, :subject))
        .to eq email_campaign.subject_multiloc['en']
    end

    context 'when the locale is specified' do
      let(:locale) { 'nl-NL' }

      before do
        email_campaign.update!(subject_multiloc: { 'nl-NL': 'Some dutch' })
      end

      example_request 'Returns the topic in the specified locale' do
        assert_status 200
        expect(json_response_body.dig(:email_campaign, :subject))
          .to eq email_campaign.subject_multiloc['nl-NL']
      end
    end
  end

  include_examples '/api/v2/.../deleted', :email_campaigns
end
