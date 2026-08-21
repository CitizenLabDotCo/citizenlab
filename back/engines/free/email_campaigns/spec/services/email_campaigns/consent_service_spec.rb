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

    it 'logs the consent when it flips' do
      expect { service.record!(user, campaign_class, consented: true) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          an_instance_of(EmailCampaigns::Consent),
          'consent_given',
          user,
          kind_of(Integer),
          payload: { campaign_type: campaign_class.name }
        )
    end

    it 'does not log an unchanged consent' do
      create(:consent, :sms_manual, user: user, consented: true)

      expect { service.record!(user, campaign_class, consented: true) }
        .not_to have_enqueued_job(LogActivityJob)
    end
  end

  describe 'grant!' do
    it 'creates a consented consent when none exists' do
      consent = service.grant!(user, campaign_class)

      expect(consent).to be_persisted
      expect(consent.consented).to be true
    end

    it 'consents again after a withdrawal' do
      create(:consent, :sms_manual, user: user, consented: false)

      expect(service.grant!(user, campaign_class).consented).to be true
    end

    it 'logs the grant even when the consent is unchanged' do
      create(:consent, :sms_manual, user: user, consented: true)

      expect { service.grant!(user, campaign_class) }
        .to have_enqueued_job(LogActivityJob)
        .with(
          an_instance_of(EmailCampaigns::Consent),
          'consent_given',
          user,
          kind_of(Integer),
          payload: { campaign_type: campaign_class.name }
        )
    end
  end
end
