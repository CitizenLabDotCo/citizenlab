# frozen_string_literal: true

require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource 'SMS balance' do
  explanation 'How many of the tenant\'s purchased SMS messages are left, and what consumed them'

  include_context 'with sms feature enabled'

  before do
    header 'Content-Type', 'application/json'
    SettingsService.new.activate_feature!('sms', settings: { 'messages_purchased' => 500 })
  end

  get 'web_api/v1/sms/balance' do
    let!(:manual_campaign) { create(:sms_manual_campaign) }
    let!(:otp_campaign) { create(:new_phone_confirmation_campaign) }

    before do
      # 3 sends of 2 segments each — the provider bills, and we count, per segment.
      create_list(:sms_delivery, 3, campaign: manual_campaign, status: 'sent', segments_count: 2)
      # Absorbed by Go Vocal rather than charged to the tenant.
      create_list(:sms_delivery, 2, campaign: otp_campaign, status: 'delivered')
      # Neither of these reached the provider, so neither is charged.
      create(:sms_delivery, campaign: manual_campaign, status: 'pending')
      create(:sms_delivery, campaign: manual_campaign, status: 'errored')
    end

    context 'as an admin' do
      before { header_token_for create(:admin) }

      example_request 'Get the SMS message balance and usage breakdown' do
        assert_status 200
        json_response = json_parse(response_body)
        expect(json_response[:data][:type]).to eq 'sms_balance'
        expect(json_response[:data][:attributes]).to match({
          purchased: 500,
          used: 6,
          balance: 494,
          used_manual: 6,
          used_other: 0
        })
      end
    end

    context 'as a moderator' do
      before { header_token_for create(:project_moderator) }

      example_request 'is allowed, matching who can see the SMS campaigns' do
        assert_status 200
      end
    end

    context 'as a regular user' do
      before { header_token_for create(:user) }

      example_request 'is not authorized' do
        assert_status 401
      end
    end

    context 'when not logged in' do
      example_request 'is not authorized' do
        assert_status 401
      end
    end

    context 'when the sms feature is disabled' do
      before do
        SettingsService.new.deactivate_feature!('sms')
        header_token_for create(:admin)
      end

      example_request 'is not authorized' do
        assert_status 401
      end
    end
  end
end
