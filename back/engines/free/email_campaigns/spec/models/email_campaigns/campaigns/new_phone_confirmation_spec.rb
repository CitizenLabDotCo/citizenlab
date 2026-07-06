# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewPhoneConfirmation do
  subject(:campaign) { described_class.create! }

  let(:new_phone_number) { '+14155552671' }

  describe 'channel and flags' do
    it { expect(campaign.channel).to eq('sms') }
    it { expect(campaign.manual?).to be(false) }
    it { expect(campaign.can_be_disabled?).to be(false) }
    it { expect(campaign.hidden_from_admin?).to be(true) }
  end

  describe '#sms_body' do
    let(:recipient) { create(:user, locale: 'en', new_phone_number: new_phone_number) }

    it 'renders the localized body with the code interpolated' do
      command = { recipient: recipient, event_payload: { code: '1234' } }
      expect(campaign.sms_body(command)).to eq('Your confirmation code is 1234.')
    end
  end

  describe '#sms_destination' do
    let(:recipient) { create(:user, new_phone_number: new_phone_number) }

    it 'targets the pending new_phone_number being verified' do
      expect(campaign.sms_destination({ recipient: recipient })).to eq(new_phone_number)
    end
  end

  describe '#deliver_now' do
    include_context 'with stubbed SMS provider'

    let(:recipient) { create(:user, locale: 'en', new_phone_number: new_phone_number) }
    let(:command) { { recipient: recipient, event_payload: { code: '1234' } } }

    before do
      SettingsService.new.activate_feature!('sms', settings: {
        'twilio_account_sid' => 'AC_test',
        'twilio_auth_token' => 'token',
        'twilio_phone_number' => '+15005550006'
      })
    end

    it 'sends synchronously to the pending number, creating a campaign-linked delivery' do
      delivery = nil
      expect { delivery = campaign.deliver_now(command) }
        .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      expect(delivery.campaign_id).to eq(campaign.id)
      expect(sms_provider).to have_received(:send).with(to: new_phone_number, body: 'Your confirmation code is 1234.')
    end

    it 'does not enqueue a background SendJob' do
      expect { campaign.deliver_now(command) }.not_to have_enqueued_job(EmailCampaigns::Sms::SendJob)
    end
  end
end
