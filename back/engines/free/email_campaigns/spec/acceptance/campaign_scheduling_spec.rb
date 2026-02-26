# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'Campaign Scheduling' do
  explanation 'Scheduling and cancelling manual email campaigns'

  before do
    header 'Content-Type', 'application/json'
    @user = create(:admin)
    EmailCampaigns::UnsubscriptionToken.create!(user_id: @user.id)
    header_token_for @user
  end

  patch 'web_api/v1/campaigns/:id' do
    parameter :scheduled_at, 'The datetime at which the campaign should be sent (ISO 8601)', scope: :campaign

    let(:campaign) { create(:manual_campaign) }
    let(:id) { campaign.id }

    example 'Schedule a campaign for future sending' do
      scheduled_time = 2.hours.from_now.iso8601
      do_request(campaign: { scheduled_at: scheduled_time })

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :scheduled_at)).to be_present
    end

    example 'Unschedule a campaign by setting scheduled_at to nil' do
      campaign.update_column(:scheduled_at, 2.hours.from_now)
      do_request(campaign: { scheduled_at: nil })

      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :scheduled_at)).to be_nil
    end

    example '[error] Schedule a campaign with a past date' do
      do_request(campaign: { scheduled_at: 1.hour.ago.iso8601 })

      assert_status 422
    end
  end

  post 'web_api/v1/campaigns/:id/cancel_sending' do
    let(:campaign) { create(:manual_campaign, scheduled_at: 2.hours.from_now) }
    let(:id) { campaign.id }

    example_request 'Cancel a scheduled campaign' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :scheduled_at)).to be_nil
      expect(campaign.reload.scheduled_at).to be_nil
    end

    example '[error] Cancel sending for a campaign that is not scheduled' do
      campaign.update_column(:scheduled_at, nil)
      do_request

      assert_status 422
    end

    example '[Unauthorized] Cancel sending for a campaign that has already been sent' do
      create(:delivery, campaign: campaign)
      do_request

      assert_status 401
    end
  end

  get 'web_api/v1/campaigns/:id' do
    let(:campaign) { create(:manual_campaign, scheduled_at: 2.hours.from_now) }
    let(:id) { campaign.id }

    example_request 'Get a scheduled campaign includes scheduled_at' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :scheduled_at)).to be_present
    end
  end

  post 'web_api/v1/campaigns/:id/send' do
    let(:campaign) { create(:manual_campaign, scheduled_at: 2.hours.from_now) }
    let(:id) { campaign.id }

    example_request 'Send a scheduled campaign immediately (overrides schedule)' do
      assert_status 200
      json_response = json_parse(response_body)
      expect(json_response.dig(:data, :attributes, :deliveries_count)).to be >= 1
    end
  end
end
