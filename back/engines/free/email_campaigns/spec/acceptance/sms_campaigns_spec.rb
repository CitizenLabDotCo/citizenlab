# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'SMS campaigns' do
  explanation 'Manual SMS campaigns, created and sent like email manual campaigns but delivered over SMS'

  include ActiveJob::TestHelper

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin)
    header_token_for @user
  end

  get 'web_api/v1/campaigns' do
    parameter :channel, 'Filter by delivery channel (email or sms)', required: false
    parameter :manual, 'Filter manual campaigns', required: false

    before do
      @sms_campaign = create(:sms_manual_campaign)
      @email_campaign = create(:manual_campaign)
    end

    let(:channel) { 'sms' }
    let(:manual) { true }

    example_request 'List only SMS campaigns when filtering by channel' do
      expect(status).to eq 200
      json_response = json_parse(response_body)
      ids = json_response[:data].pluck(:id)
      expect(ids).to include(@sms_campaign.id)
      expect(ids).not_to include(@email_campaign.id)
    end
  end

  post 'web_api/v1/campaigns' do
    with_options scope: :campaign do
      parameter :campaign_name, "The campaign type ('sms_manual')", required: true
      parameter :body_multiloc, 'The SMS text, as a multiloc string', required: true
      parameter :group_ids, 'Array of recipient group ids', required: false
    end

    let(:campaign_name) { 'sms_manual' }
    let(:body_multiloc) { { 'en' => 'Hello from SMS' } }

    example_request 'Create an SMS manual campaign' do
      expect(response_status).to eq 201
      json = json_parse(response_body)
      expect(json.dig(:data, :attributes, :campaign_name)).to eq 'sms_manual'
      expect(json.dig(:data, :attributes, :channel)).to eq 'sms'
      expect(json.dig(:data, :attributes, :body_multiloc, :en)).to eq 'Hello from SMS'
    end
  end

  post 'web_api/v1/campaigns/:id/send' do
    let(:campaign) { create(:sms_manual_campaign) }
    let(:id) { campaign.id }
    let!(:recipient) do
      user = create(:user, phone_number: '+14155552671', phone_number_verified_at: Time.zone.now)
      create(:sms_consent, user: user, campaign_type: campaign.type, consented: true)
      user
    end

    example 'Send an SMS campaign enqueues SMS jobs for opted-in recipients' do
      expect { do_request }.to have_enqueued_job(Sms::SendJob)
      expect(response_status).to eq 200
    end
  end
end
