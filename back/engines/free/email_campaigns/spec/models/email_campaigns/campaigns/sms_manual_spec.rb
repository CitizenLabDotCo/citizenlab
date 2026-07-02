# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::SmsManual do
  describe 'SmsManual default factory' do
    it 'is valid' do
      expect(build(:sms_manual_campaign)).to be_valid
    end

    it 'is invalid without a body' do
      expect(build(:sms_manual_campaign, body_multiloc: {})).not_to be_valid
    end

    it 'is invalid without a subject' do
      expect(build(:sms_manual_campaign, subject_multiloc: {})).not_to be_valid
    end
  end

  describe 'channel and manual flags' do
    subject(:campaign) { build(:sms_manual_campaign) }

    it { expect(campaign.channel).to eq('sms') }
    it { expect(campaign.manual?).to be(true) }
    it { expect(campaign.can_be_disabled?).to be(false) }

    it 'persists the sms channel' do
      campaign.save!
      expect(campaign.reload.channel).to eq('sms')
    end
  end

  describe '#sent?' do
    let(:campaign) { create(:sms_manual_campaign) }

    it 'is false with no deliveries and true once an EmailCampaigns::Sms::Delivery is linked' do
      expect(campaign.sent?).to be(false)
      EmailCampaigns::Sms::Delivery.create!(campaign: campaign, body: 'hi', status: 'pending')
      expect(campaign.sent?).to be(true)
    end
  end

  describe '#generate_commands' do
    let(:campaign) { create(:sms_manual_campaign) }
    let(:recipient) { create(:user) }

    it 'generates a command with only the SMS payload (no subject/sender)' do
      expect(campaign.generate_commands(recipient: recipient)&.first).to match({
        author: campaign.author,
        event_payload: {},
        body_multiloc: campaign.body_multiloc
      })
    end
  end

  describe 'apply_recipient_filters' do
    let(:campaign) { build(:sms_manual_campaign) }

    it 'seeds recipients from users with a phone number and excludes phone-less users' do
      with_phone = create(:user, phone_number: '+14155552671')
      without_phone = create(:user, phone_number: nil)

      expect(campaign.apply_recipient_filters).to include(with_phone)
      expect(campaign.apply_recipient_filters).not_to include(without_phone)
    end

    it 'filters out invitees' do
      invitee = create(:invited_user, phone_number: '+14155552672')

      expect(campaign.apply_recipient_filters).not_to include(invitee)
    end
  end
end
