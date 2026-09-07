# frozen_string_literal: true

require 'rails_helper'

describe EmailCampaigns::ConsentService do
  include_context 'with sms manual campaigns feature enabled'

  let(:service) { described_class.new }
  let(:user) { create(:user, :with_confirmed_phone) }
  let(:campaign_class) { EmailCampaigns::Campaigns::SmsManual }

  def sms_manual_consent
    EmailCampaigns::Consent.find_by(user: user, campaign_type: campaign_class.name)
  end

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

    it 'logs an unchanged consent when always_log is set' do
      create(:consent, :sms_manual, user: user, consented: true)

      expect { service.record!(user, campaign_class, consented: true, always_log: true) }
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

  describe 'record_for_sms_use_case!' do
    it 'records consent for every consentable campaign on the use case' do
      service.record_for_sms_use_case!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS, consented: true)

      expect(sms_manual_consent.consented).to be true
    end

    it 'overwrites an existing consent' do
      create(:consent, :sms_manual, user: user, consented: true)

      service.record_for_sms_use_case!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS, consented: false)

      expect(sms_manual_consent.consented).to be false
    end

    it 'records a withdrawal for a user that never consented' do
      service.record_for_sms_use_case!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS, consented: false)

      expect(sms_manual_consent.consented).to be false
    end

    it 'leaves campaigns on another use case untouched' do
      create(:consent, :sms_manual, user: user, consented: true)

      service.record_for_sms_use_case!(user, EmailCampaigns::Sms::UseCase::CONFIRMATION_CODES, consented: false)

      expect(sms_manual_consent.consented).to be true
    end

    it 'leaves email campaigns untouched' do
      email_consent = create(:consent, user: user, consented: true)

      service.record_for_sms_use_case!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS, consented: false)

      expect(email_consent.reload.consented).to be true
    end

    it 'logs the consent' do
      expect { service.record_for_sms_use_case!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS, consented: true) }
        .to have_enqueued_job(LogActivityJob)
    end

    it 'does nothing without a user or a use case' do
      expect { service.record_for_sms_use_case!(nil, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS, consented: true) }
        .not_to change(EmailCampaigns::Consent, :count)
      expect { service.record_for_sms_use_case!(user, nil, consented: true) }
        .not_to change(EmailCampaigns::Consent, :count)
    end
  end
end
