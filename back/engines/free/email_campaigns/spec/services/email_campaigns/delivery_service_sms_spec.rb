# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::DeliveryService do
  subject(:service) { described_class.new }

  include_context 'with sms feature enabled'

  describe '#send_now (SMS channel)' do
    let(:campaign) { create(:sms_manual_campaign) }
    let!(:recipient) { create(:user, phone: '+14155552671', phone_confirmed_at: Time.zone.now, locale: 'en') }

    before { create(:user, phone: nil) } # phone-less user is not a recipient

    it 'synchronously creates a pending campaign-linked EmailCampaigns::Sms::Delivery per phone-having recipient' do
      expect { service.send_now(campaign) }.to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      delivery = campaign.sms_deliveries.sole
      expect(delivery).to have_attributes(
        user_id: recipient.id,
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

    it 'skips a recipient whose number is unsendable and still delivers to the others' do
      # +32... is Belgian, +1415... (the recipient above) is not.
      create(:user, phone: '+32470123456', phone_confirmed_at: Time.zone.now, locale: 'en')
      SettingsService.new.activate_feature!('sms', settings: { 'allowed_country_codes' => ['BE'] })
      allow(ErrorReporter).to receive(:report)

      expect { service.send_now(campaign) }.to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      expect(campaign.sms_deliveries.sole.user_id).not_to eq(recipient.id)
      expect(ErrorReporter).to have_received(:report)
        .with(an_instance_of(EmailCampaigns::Sms::Error), hash_including(:extra))
    end
  end

  describe '#send_sms_preview' do
    let(:campaign) { create(:sms_manual_campaign) }
    let(:previewer) { create(:admin, phone: '+14155552672', locale: 'en') }

    it 'sends a test SMS to the previewer without linking it to the campaign' do
      expect { service.send_sms_preview(campaign, previewer) }
        .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      delivery = EmailCampaigns::Sms::Delivery.last
      expect(delivery).to have_attributes(
        user_id: previewer.id,
        campaign_id: nil
      )
      expect(campaign.sent?).to be(false)
      expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued.with(delivery.id)
    end

    it 'raises EmailCampaigns::Sms::Error when the previewer has no phone number' do
      previewer.update_columns(phone: nil)
      expect { service.send_sms_preview(campaign, previewer) }.to raise_error(EmailCampaigns::Sms::Error)
    end
  end
end
