# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Sms::UseCaseConsentService do
  include_context 'with sms manual campaigns feature enabled'

  let(:user) { create(:user, :with_confirmed_phone) }

  def sms_manual_consent
    EmailCampaigns::Consent.find_by(user: user, campaign_type: EmailCampaigns::Campaigns::SmsManual.name)
  end

  describe '#withdraw!' do
    it 'withdraws consent for every consentable campaign on the use case' do
      create(:consent, :sms_manual, user: user, consented: true)

      described_class.new.withdraw!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS)

      expect(sms_manual_consent.consented).to be false
    end

    it 'records a withdrawn consent for a user that never had one' do
      described_class.new.withdraw!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS)

      expect(sms_manual_consent.consented).to be false
    end

    it 'leaves campaigns on another use case untouched' do
      create(:consent, :sms_manual, user: user, consented: true)

      described_class.new.withdraw!(user, EmailCampaigns::Sms::UseCase::CONFIRMATION_CODES)

      expect(sms_manual_consent.consented).to be true
    end

    it 'leaves email campaigns untouched' do
      email_consent = create(:consent, user: user, consented: true)

      described_class.new.withdraw!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS)

      expect(email_consent.reload.consented).to be true
    end

    it 'logs the withdrawal' do
      create(:consent, :sms_manual, user: user, consented: true)

      expect { described_class.new.withdraw!(user, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS) }
        .to have_enqueued_job(LogActivityJob)
    end

    it 'does nothing without a user or a use case' do
      expect { described_class.new.withdraw!(nil, EmailCampaigns::Sms::UseCase::MANUAL_CAMPAIGNS) }
        .not_to change(EmailCampaigns::Consent, :count)
      expect { described_class.new.withdraw!(user, nil) }.not_to change(EmailCampaigns::Consent, :count)
    end
  end
end
