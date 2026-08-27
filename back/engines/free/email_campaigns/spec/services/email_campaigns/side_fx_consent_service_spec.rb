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

    it 'logs an unchanged consent when always_log is set' do
      consent = create(:consent, user: user, consented: true)
      consent.reload
      expect { service.after_update(consent, user, always_log: true) }
        .to enqueue_job(LogActivityJob)
        .with(consent, 'consent_given', user, kind_of(Integer), payload: { campaign_type: consent.campaign_type })
    end
  end
end
