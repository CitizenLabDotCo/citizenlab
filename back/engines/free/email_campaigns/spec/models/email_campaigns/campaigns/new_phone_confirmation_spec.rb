# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewPhoneConfirmation do
  subject(:campaign) { described_class.create! }

  describe 'channel and flags' do
    it { expect(campaign.channel).to eq(:sms) }
    it { expect(campaign.manual?).to be(false) }
    it { expect(campaign.can_be_disabled?).to be(false) }
    it { expect(campaign.hidden_from_admin?).to be(true) }
  end

  describe '#sms_body' do
    let(:recipient) { create(:user, locale: 'en', new_phone_number: '+14155552671') }

    it 'renders the localized body with the code interpolated' do
      expect(campaign.sms_body(recipient, code: '1234')).to eq('Your verification code is 1234.')
    end
  end
end
