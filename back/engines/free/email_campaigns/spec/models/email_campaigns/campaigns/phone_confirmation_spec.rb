# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::PhoneConfirmation do
  subject(:campaign) { described_class.create! }

  before_all do
    config = AppConfiguration.instance
    config.settings['core']['organization_name'] = { 'en' => 'Vaudeville' }
    config.save!
  end

  let(:phone) { '+14155552671' }

  describe 'channel and flags' do
    it { expect(campaign.channel).to eq('sms') }
    it { expect(campaign.manual?).to be(false) }
    it { expect(campaign.can_be_disabled?).to be(false) }
    it { expect(campaign.hidden_from_admin?).to be(true) }
    it { expect(described_class.consented_by_default?).to be(false) }
    it { expect(described_class.include?(EmailCampaigns::Consentable)).to be(true) }
  end

  describe '#sms_body' do
    let(:recipient) { create(:user, locale: 'en', phone: phone) }

    it 'renders the localized body with the code interpolated' do
      command = { recipient: recipient, event_payload: { code: '1234' } }
      expect(campaign.sms_body(command)).to eq('Vaudeville: Your confirmation code is 1234.')
    end

    it 'falls back to another locale when the organization name is blank for the recipient locale' do
      config = AppConfiguration.instance
      config.settings['core']['organization_name'] = { 'en' => '', 'nl-NL' => 'Vaudeville' }
      config.save!

      command = { recipient: recipient, event_payload: { code: '1234' } }
      expect(campaign.sms_body(command)).to eq('Vaudeville: Your confirmation code is 1234.')
    end
  end

  describe '#sms_destination' do
    let(:recipient) { create(:user, phone: phone) }

    it 'targets the confirmed phone on the user' do
      expect(campaign.sms_destination({ recipient: recipient })).to eq(phone)
    end
  end

  describe '#deliver_now' do
    include_context 'with stubbed SMS provider'

    let(:recipient) { create(:user, locale: 'en', phone: phone) }
    let(:command) { { recipient: recipient, event_payload: { code: '1234' } } }

    it 'sends synchronously to the confirmed number, creating a campaign-linked delivery' do
      delivery = nil
      expect { delivery = campaign.deliver_now(command) }
        .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      expect(delivery.campaign_id).to eq(campaign.id)
      expect(sms_provider).to have_received(:send)
        .with(to: phone, body: 'Vaudeville: Your confirmation code is 1234.', use_case: EmailCampaigns::Sms::UseCase::CONFIRMATION_CODES)
    end

    it 'does not enqueue a background SendJob' do
      expect { campaign.deliver_now(command) }.not_to have_enqueued_job(EmailCampaigns::Sms::SendJob)
    end
  end
end
