# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::NewPhoneConfirmationTexter do
  subject(:texter) { described_class.with(campaign: campaign, command: command) }

  let(:campaign) { EmailCampaigns::Campaigns::NewPhoneConfirmation.create! }
  let(:recipient) { create(:user, locale: 'en', new_phone_number: '+14155552671') }
  let(:command) { { recipient: recipient, event_payload: { code: '1234' } } }

  before do
    SettingsService.new.activate_feature!('sms', settings: {
      'twilio_account_sid' => 'AC_test',
      'twilio_auth_token' => 'token',
      'twilio_phone_number' => '+15005550006'
    })
  end

  describe '#body' do
    it 'renders the localized body with the code interpolated' do
      expect(texter.body).to eq('Your verification code is 1234.')
    end
  end

  describe '#destination' do
    it 'targets the pending new_phone_number being verified' do
      expect(texter.destination).to eq('+14155552671')
    end
  end

  describe '#deliver_now' do
    include_context 'with stubbed SMS provider'

    it 'sends synchronously to the pending number, creating a campaign-linked delivery' do
      delivery = nil
      expect { delivery = texter.deliver_now }
        .to change(EmailCampaigns::Sms::Delivery, :count).by(1)

      expect(delivery.campaign_id).to eq(campaign.id)
      expect(sms_provider).to have_received(:send).with(to: '+14155552671', body: 'Your verification code is 1234.')
    end

    it 'does not enqueue a background SendJob' do
      expect { texter.deliver_now }.not_to have_enqueued_job(EmailCampaigns::Sms::SendJob)
    end
  end
end
