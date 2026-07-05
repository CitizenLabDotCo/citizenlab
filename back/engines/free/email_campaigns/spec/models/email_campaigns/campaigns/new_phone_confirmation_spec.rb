# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EmailCampaigns::Campaigns::NewPhoneConfirmation do
  subject(:campaign) { described_class.create! }

  describe 'channel and flags' do
    it { expect(campaign.channel).to eq('sms') }
    it { expect(campaign.manual?).to be(false) }
    it { expect(campaign.can_be_disabled?).to be(false) }
    it { expect(campaign.hidden_from_admin?).to be(true) }
  end

  describe '#texter_class' do
    it { expect(campaign.texter_class).to eq(EmailCampaigns::NewPhoneConfirmationTexter) }
  end
end
