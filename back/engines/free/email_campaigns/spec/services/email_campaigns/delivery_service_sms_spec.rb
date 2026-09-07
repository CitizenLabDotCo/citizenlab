# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::DeliveryService do
  subject(:service) { described_class.new }

  include_context 'with sms manual campaigns feature enabled'

  describe '#campaign_classes' do
    it 'includes SmsManual when both the sms and sms_manual_campaigns features are activated' do
      expect(service.campaign_classes).to include(EmailCampaigns::Campaigns::SmsManual)
    end

    it 'excludes SmsManual but keeps the OTP campaigns when sms_manual_campaigns is deactivated' do
      SettingsService.new.deactivate_feature!('sms_manual_campaigns')

      expect(service.campaign_classes).not_to include(EmailCampaigns::Campaigns::SmsManual)
      expect(service.campaign_classes).to include(EmailCampaigns::Campaigns::PhoneConfirmation)
    end

    it 'excludes SmsManual when sms is deactivated, whatever sms_manual_campaigns says' do
      SettingsService.new.deactivate_feature!('sms')

      expect(service.campaign_classes).not_to include(EmailCampaigns::Campaigns::SmsManual)
    end
  end

  describe '#send_now (SMS channel)' do
    let(:campaign) { create(:sms_manual_campaign) }
    let!(:recipient) { create(:user, phone: '+14155552671', phone_confirmed_at: Time.zone.now, locale: 'en') }

    before do
      create(:consent, :sms_manual, user: recipient)
      create(:consent, :sms_manual, user: create(:user, phone: nil)) # phone-less user is not a recipient
    end

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
      expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued
        .with(delivery.id, use_case: EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS).exactly(:once)
      expect(campaign.sent?).to be(true)
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
      expect(EmailCampaigns::Sms::SendJob).to have_been_enqueued
        .with(delivery.id, use_case: EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS)
    end

    it 'raises EmailCampaigns::Sms::Error when the previewer has no phone number' do
      previewer.update_columns(phone: nil)
      expect { service.send_sms_preview(campaign, previewer) }.to raise_error(EmailCampaigns::Sms::Error)
    end
  end
end
