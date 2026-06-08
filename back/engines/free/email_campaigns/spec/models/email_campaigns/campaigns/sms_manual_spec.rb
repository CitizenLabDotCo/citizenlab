# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::SmsManual do
  describe 'validations' do
    it 'is valid with a body_multiloc' do
      campaign = build(:sms_manual_campaign)
      expect(campaign).to be_valid
    end

    it 'is invalid without a body_multiloc' do
      campaign = build(:sms_manual_campaign, body_multiloc: {})
      expect(campaign).to be_invalid
      expect(campaign.errors[:body_multiloc]).to be_present
    end

    it 'is invalid when the body exceeds the max length' do
      campaign = build(:sms_manual_campaign, body_multiloc: { 'en' => 'a' * (described_class::MAX_LENGTH + 1) })
      expect(campaign).to be_invalid
      expect(campaign.errors[:body_multiloc]).to be_present
    end
  end

  describe '#delivery_channel' do
    it 'is :sms' do
      expect(build(:sms_manual_campaign).delivery_channel).to eq(:sms)
    end
  end

  describe '#generate_commands' do
    it 'returns one command with the localized plain-text body' do
      campaign = build(:sms_manual_campaign, body_multiloc: { 'en' => 'Hi', 'fr-FR' => 'Salut' })
      recipient = build(:user, locale: 'fr-FR')

      commands = campaign.generate_commands(recipient: recipient)

      expect(commands).to eq([{ event_payload: {}, body: 'Salut' }])
    end
  end

  describe '#apply_recipient_filters' do
    let(:campaign) { create(:sms_manual_campaign) }

    it 'includes only active users with a verified phone who opted in' do
      opted_in = create(:user, phone_number: '+14155552671', phone_number_verified_at: Time.zone.now)
      create(:sms_consent, user: opted_in, campaign_type: campaign.type, consented: true)

      not_opted_in = create(:user, phone_number: '+14155552672', phone_number_verified_at: Time.zone.now)
      create(:sms_consent, user: not_opted_in, campaign_type: campaign.type, consented: false)

      no_phone = create(:user)
      create(:sms_consent, user: no_phone, campaign_type: campaign.type, consented: true)

      unverified_phone = create(:user, phone_number: '+14155552673')
      create(:sms_consent, user: unverified_phone, campaign_type: campaign.type, consented: true)

      recipients = campaign.apply_recipient_filters

      expect(recipients).to include(opted_in)
      expect(recipients).not_to include(not_opted_in, no_phone, unverified_phone)
    end
  end
end
