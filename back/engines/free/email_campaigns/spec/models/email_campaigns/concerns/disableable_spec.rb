# frozen_string_literal: true

require 'rails_helper'

class DisableableCampaignForTest < EmailCampaigns::Campaign
  include EmailCampaigns::Disableable
end

RSpec.describe EmailCampaigns::Disableable do
  let(:campaign) { DisableableCampaignForTest.create! }

  describe 'run_before_send_hooks' do
    it 'returns true when the campaign is enabled' do
      campaign.update!(enabled: true)
      expect(campaign.run_before_send_hooks).to be true
    end

    it 'returns false when the campaign is disabled' do
      campaign.update!(enabled: false)
      expect(campaign.run_before_send_hooks).to be_falsy
    end
  end
end
