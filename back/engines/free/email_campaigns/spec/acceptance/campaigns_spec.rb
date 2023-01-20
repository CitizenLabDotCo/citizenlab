# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Campaigns' do
  explanation 'E-mail campaigns, both automated and manual'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin)
    EmailCampaigns::UnsubscriptionToken.create!(user_id: @user.id)
    token = Knock::AuthToken.new(payload: @user.to_token_payload).token
    header 'Authorization', "Bearer #{token}"
  end

  get '/web_api/v1/campaigns' do
    before do
      @campaigns = create_list(:admin_rights_received_campaign, 3)
      create_list(:official_feedback_on_voted_initiative_campaign, 2)
    end

    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of campaigns per page'
    end
    parameter :campaign_names, "An array of campaign names that should be returned. Possible values are #{EmailCampaigns::DeliveryService.new.campaign_classes.map(&:campaign_name).join(', ')}", required: false
    parameter :without_campaign_names, "An array of campaign names that should not be returned. Possible values are #{EmailCampaigns::DeliveryService.new.campaign_classes.map(&:campaign_name).join(', ')}", required: false

    example_request 'List all campaigns' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 5
    end

    example 'List all campaigns except admin_rights_received' do
      do_request(without_campaign_names: ['admin_rights_received'])
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq 2
    end
  end

  get '/web_api/v1/campaigns/:id' do
    let(:campaign) { create(:admin_rights_received_campaign) }
    let(:id) { campaign.id }

    example_request 'Get one campaign by id' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :id)).to eq id
    end
  end

  get '/web_api/v1/campaigns/:id/preview' do
    let(:campaign) { create(:admin_digest_campaign) }
    let(:id) { campaign.id }

    example_request 'Get a campaign HTML preview' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:html]).to be_present
    end
  end

  get 'web_api/v1/campaigns/:id/deliveries' do
    with_options scope: :page do
      parameter :number, 'Page number'
      parameter :size, 'Number of deliveries per page'
    end

    let(:campaign) { create :admin_rights_received_campaign }
    let!(:id) { campaign.id }
    let!(:deliveries) { create_list :delivery, 5, campaign: campaign }

    example_request 'Get the deliveries of a sent campaign. Includes the recipients.' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq deliveries.size
      expect(json_response[:included].size).to eq deliveries.size
    end
  end

  get 'web_api/v1/campaigns/:id/stats' do
    let(:campaign) { create(:admin_rights_received_campaign) }
    let!(:id) { campaign.id }
    let!(:deliveries) do
      create_list(
        :delivery, 20,
        campaign: campaign,
        delivery_status: 'accepted'
      )
    end

    example_request 'Get the delivery statistics of a sent campaing' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response).to match({
        sent: 20,
        bounced: 0,
        failed: 0,
        accepted: 20,
        delivered: 0,
        opened: 0,
        clicked: 0,
        total: 20
      })
    end
  end
end
