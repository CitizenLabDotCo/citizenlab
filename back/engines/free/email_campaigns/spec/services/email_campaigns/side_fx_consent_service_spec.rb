# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::SideFxConsentService do
  let(:service) { described_class.new }
  let(:user) { create(:user) }

  describe 'after_update' do
    it "logs 'consent_given' when consent is granted" do
      consent = create(:consent, user: user, consented: false)
      consent.update!(consented: true)
      expect { service.after_update(consent, user) }
        .to enqueue_job(LogActivityJob)
        .with(consent, 'consent_given', user, consent.updated_at.to_i, payload: { campaign_type: consent.campaign_type })
    end

    it "logs 'consent_withdrawn' when consent is revoked" do
      consent = create(:consent, user: user, consented: true)
      consent.update!(consented: false)
      expect { service.after_update(consent, user) }
        .to enqueue_job(LogActivityJob)
        .with(consent, 'consent_withdrawn', user, consent.updated_at.to_i, payload: { campaign_type: consent.campaign_type })
    end

    it 'does not log when consented did not change' do
      consent = create(:consent, user: user, consented: true)
      consent.reload
      expect { service.after_update(consent, user) }
        .not_to enqueue_job(LogActivityJob)
    end
  end

  describe 'record_consent' do
    let(:campaign_class) { EmailCampaigns::Campaigns::SmsManual }

    it 'creates the consent and logs it' do
      expect { service.record_consent(user, campaign_class, consented: true) }
        .to enqueue_job(LogActivityJob)
        .with(an_instance_of(EmailCampaigns::Consent), 'consent_given', user, kind_of(Integer), payload: { campaign_type: campaign_class.name })
      consent = EmailCampaigns::Consent.find_by(user: user, campaign_type: campaign_class.name)
      expect(consent.consented).to be true
    end

    it 'updates the existing consent and logs it when the value flips' do
      consent = create(:consent, :sms_manual, user: user, consented: true)

      expect { service.record_consent(user, campaign_class, consented: false) }
        .to enqueue_job(LogActivityJob)
        .with(consent, 'consent_withdrawn', user, kind_of(Integer), payload: { campaign_type: campaign_class.name })
      expect(consent.reload.consented).to be false
    end

    it 'does not log when consented did not change' do
      create(:consent, :sms_manual, user: user, consented: true)

      expect { service.record_consent(user, campaign_class, consented: true) }
        .not_to enqueue_job(LogActivityJob)
    end

    it 'logs when consented did not change and log_if_unchanged is set' do
      consent = create(:consent, :sms_manual, user: user, consented: true)

      expect { service.record_consent(user, campaign_class, consented: true, log_if_unchanged: true) }
        .to enqueue_job(LogActivityJob)
        .with(consent, 'consent_given', user, kind_of(Integer), payload: { campaign_type: campaign_class.name })
    end
  end
end
