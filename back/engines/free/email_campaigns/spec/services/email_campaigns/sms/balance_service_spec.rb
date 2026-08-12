# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::BalanceService do
  subject(:service) { described_class.new }

  include_context 'with sms feature enabled'

  before do
    SettingsService.new.activate_feature!('sms', settings: { 'messages_purchased' => 1000 })
  end

  describe '#purchased' do
    it 'reads the cumulative setting' do
      expect(service.purchased).to eq 1000
    end

    it 'falls back to 0 when the setting is absent' do
      config = AppConfiguration.instance
      config.settings['sms'].delete('messages_purchased')
      config.save!

      expect(described_class.new.purchased).to eq 0
    end
  end

  describe '#used_breakdown' do
    let(:manual_campaign) { create(:sms_manual_campaign) }
    let(:otp_campaign) { create(:new_phone_confirmation_campaign) }

    it 'splits billable deliveries over the campaign types' do
      create_list(:sms_delivery, 3, campaign: manual_campaign, status: 'sent')
      create_list(:sms_delivery, 2, campaign: otp_campaign, status: 'delivered')

      expect(service.used_breakdown).to eq(used_otp: 2, used_manual: 3, used_other: 0)
    end

    it 'counts both phone confirmation campaigns as verification codes' do
      create(:sms_delivery, campaign: create(:phone_confirmation_campaign), status: 'sent')
      create(:sms_delivery, campaign: otp_campaign, status: 'sent')

      expect(service.used_breakdown).to eq(used_otp: 2, used_manual: 0, used_other: 0)
    end

    it 'counts a multi-segment message once per segment' do
      create(:sms_delivery, campaign: manual_campaign, status: 'delivered', segments_count: 3)
      create(:sms_delivery, campaign: manual_campaign, status: 'delivered', segments_count: 2)

      expect(service.used).to eq 5
    end

    it 'counts a send whose segment count is not known yet as one segment' do
      create(:sms_delivery, campaign: manual_campaign, status: 'sent', segments_count: nil)

      expect(service.used).to eq 1
    end

    it 'counts every status that reached the provider, not only delivered' do
      %w[queued sent delivered undelivered failed].each do |status|
        create(:sms_delivery, campaign: manual_campaign, status: status)
      end

      expect(service.used_breakdown[:used_manual]).to eq 5
    end

    it 'ignores deliveries that never reached the provider' do
      create(:sms_delivery, campaign: manual_campaign, status: 'pending')
      create(:sms_delivery, campaign: manual_campaign, status: 'errored')

      expect(service.used).to eq 0
    end

    it 'attributes campaign-less sends (previews) to used_other' do
      create(:sms_delivery, campaign: nil, status: 'sent')

      expect(service.used_breakdown).to eq(used_otp: 0, used_manual: 0, used_other: 1)
    end

    # Verification codes are reported in the breakdown, but Go Vocal absorbs them.
    it 'leaves verification codes out of #used, counting campaigns and previews' do
      create(:sms_delivery, campaign: manual_campaign, status: 'sent')
      create(:sms_delivery, campaign: otp_campaign, status: 'sent')
      create(:sms_delivery, campaign: nil, status: 'sent')

      expect(service.used_breakdown).to eq(used_otp: 1, used_manual: 1, used_other: 1)
      expect(service.used).to eq 2
    end
  end

  describe '#balance' do
    it 'is purchased minus used' do
      create_list(:sms_delivery, 4, status: 'sent')

      expect(service.balance).to eq 996
    end

    it 'is untouched by verification codes' do
      create_list(:sms_delivery, 4, campaign: create(:new_phone_confirmation_campaign), status: 'sent')

      expect(service.balance).to eq 1000
    end

    it 'goes negative when the tenant oversends' do
      SettingsService.new.activate_feature!('sms', settings: { 'messages_purchased' => 1 })
      create_list(:sms_delivery, 3, status: 'sent')

      expect(described_class.new.balance).to eq(-2)
    end
  end

  describe '#to_h' do
    it 'exposes the totals alongside the breakdown' do
      create(:sms_delivery, campaign: create(:sms_manual_campaign), status: 'sent')

      expect(service.to_h).to eq(
        purchased: 1000,
        used: 1,
        balance: 999,
        used_otp: 0,
        used_manual: 1,
        used_other: 0
      )
    end
  end
end
