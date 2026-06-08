# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'SMS consents' do
  explanation 'An SMS consent records whether a user has opted in to a specific SMS campaign type'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin)
    header_token_for @user
  end

  get '/web_api/v1/sms_consents' do
    example_request 'List SMS consents (auto-creates opt-in rows defaulting to not consented)' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      expect(json_response[:data].size).to eq EmailCampaigns::DeliveryService.new.sms_campaign_types.size
      expect(json_response[:data].map { |c| c.dig(:attributes, :consented) }).to all(be false)
    end
  end

  patch 'web_api/v1/sms_consents/:id' do
    with_options scope: :consent do
      parameter :consented, 'Boolean indicating whether the user consents to this SMS campaign type', required: true
    end

    let(:campaign) { create(:sms_manual_campaign) }
    let(:consent) { create(:sms_consent, user: @user, campaign_type: campaign.type, consented: false) }
    let(:id) { consent.id }
    let(:consented) { true }

    example_request 'Opt in to an SMS campaign type' do
      expect(response_status).to eq 200
      expect(json_parse(response_body).dig(:data, :attributes, :consented)).to be true
    end
  end
end
