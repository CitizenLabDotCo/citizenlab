# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::PhoneConfirmation do
  subject(:campaign) { described_class.create! }

  describe 'channel and flags' do
    it { expect(campaign.channel).to eq(:sms) }
    it { expect(campaign.manual?).to be(false) }
    it { expect(campaign.can_be_disabled?).to be(false) }
    it { expect(campaign.hidden_from_admin?).to be(true) }
  end

  describe '#generate_commands' do
    let(:recipient) { create(:user, locale: 'en', new_phone_number: '+14155552671') }

    it 'renders the localized body with the code interpolated' do
      command = campaign.generate_commands(recipient: recipient, code: '1234').first

      expect(command[:event_payload]).to eq(code: '1234')
      expect(command[:body_multiloc]).to eq('en' => 'Your verification code is 1234.')
    end
  end
end
