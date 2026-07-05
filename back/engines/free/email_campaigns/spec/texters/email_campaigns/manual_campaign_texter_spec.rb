# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::ManualCampaignTexter do
  subject(:texter) { described_class.with(campaign: campaign, command: command) }

  let(:campaign) { create(:sms_manual_campaign) }
  let(:recipient) { create(:user, locale: 'en', phone_number: '+14155552671', phone_number_confirmed_at: Time.zone.now) }
  let(:command) { { recipient: recipient, body_multiloc: { 'en' => 'A short SMS update from your city.' } } }

  before do
    SettingsService.new.activate_feature!('sms', settings: {
      'twilio_account_sid' => 'AC_test',
      'twilio_auth_token' => 'token',
      'twilio_phone_number' => '+15005550006'
    })
  end

  describe '#body' do
    it 'renders the command body_multiloc in the recipient locale' do
      expect(texter.body).to eq('A short SMS update from your city.')
    end
  end

  describe '#destination' do
    it 'targets the recipient confirmed phone_number' do
      expect(texter.destination).to eq('+14155552671')
    end
  end

  describe '#deliver_later' do
    it 'creates a campaign-linked pending delivery and enqueues a SendJob' do
      delivery = nil
      expect { delivery = texter.deliver_later }
        .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      expect(delivery).to have_attributes(
        user_id: recipient.id,
        campaign_id: campaign.id,
        body: 'A short SMS update from your city.',
        status: 'pending'
      )
      expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id)
    end

    it 'still creates and enqueues the delivery, unlinked, when campaign_id: nil (preview)' do
      delivery = nil
      expect { delivery = texter.deliver_later(campaign_id: nil) }
        .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      expect(delivery.campaign_id).to be_nil
      expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id)
    end

    it 'is a no-op when the recipient has no phone number' do
      recipient.update_columns(phone_number: nil, phone_number_confirmed_at: nil)
      expect { texter.deliver_later }.not_to change(EmailCampaigns::Sms::Delivery, :count)
    end
  end
end
