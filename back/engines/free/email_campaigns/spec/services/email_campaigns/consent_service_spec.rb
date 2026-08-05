# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::ConsentService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }
  let(:campaign_class) { EmailCampaigns::Campaigns::SmsManual }

  describe 'record!' do
    it 'creates the consent when none exists' do
      consent = service.record!(user, campaign_class, consented: true)

      expect(consent).to be_persisted
      expect(consent.campaign_type).to eq campaign_class.name
      expect(consent.consented).to be true
    end

    it 'updates the existing consent' do
      existing = create(:consent, :sms_manual, user: user, consented: true)

      consent = service.record!(user, campaign_class, consented: false)

      expect(consent).to eq existing
      expect(existing.reload.consented).to be false
    end

    it 'leaves an unchanged consent untouched' do
      create(:consent, :sms_manual, user: user, consented: true)

      consent = service.record!(user, campaign_class, consented: true)

      expect(consent.saved_change_to_consented?).to be false
      expect(consent.consented).to be true
    end
  end
end
