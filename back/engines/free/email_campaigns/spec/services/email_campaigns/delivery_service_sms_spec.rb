# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::DeliveryService do
  subject(:service) { described_class.new }

  before do
    SettingsService.new.activate_feature!('sms', settings: {
      'twilio_account_sid' => 'AC_test',
      'twilio_auth_token' => 'token',
      'twilio_phone_number' => '+15005550006'
    })
  end

  describe '#send_now (SMS channel)' do
    let(:campaign) { create(:sms_manual_campaign) }
    let!(:recipient) { create(:user, phone_number: '+14155552671', locale: 'en') }

    before { create(:user, phone_number: nil) } # phone-less user is not a recipient

    it 'synchronously creates a pending campaign-linked EmailCampaigns::Sms::Delivery per phone-having recipient' do
      expect { service.send_now(campaign) }.to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      delivery = campaign.sms_deliveries.sole
      expect(delivery).to have_attributes(
        user_id: recipient.id,
        phone_number: '+14155552671',
        body: 'A short SMS update from your city.',
        status: 'pending'
      )
    end

    it 'enqueues an EmailCampaigns::Sms::SendJob for the created delivery and marks the campaign sent' do
      service.send_now(campaign)

      delivery = campaign.sms_deliveries.sole
      expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id).exactly(:once)
      expect(campaign.sent?).to be(true)
    end
  end

  describe '#send_preview (SMS channel)' do
    let(:campaign) { create(:sms_manual_campaign) }
    let(:previewer) { create(:admin, phone_number: '+14155552672', locale: 'en') }

    it 'sends a test SMS to the previewer without linking it to the campaign' do
      expect { service.send_preview(campaign, previewer) }
        .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      delivery = EmailCampaigns::Sms::Delivery.last
      expect(delivery).to have_attributes(
        user_id: previewer.id,
        phone_number: '+14155552672',
        campaign_id: nil
      )
      expect(campaign.sent?).to be(false)
      expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id)
    end

    it 'raises EmailCampaigns::Sms::Error when the previewer has no phone number' do
      previewer.update_columns(phone_number: nil)
      expect { service.send_preview(campaign, previewer) }.to raise_error(EmailCampaigns::Sms::Error)
    end
  end
end
